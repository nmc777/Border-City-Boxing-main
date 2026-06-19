import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // ignore — we always show the same confirmation
    }
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="text-green-400" size={36} />
            </div>
            <h1 className="text-3xl font-display font-bold uppercase mb-3">Check Your Email</h1>
            <p className="text-muted-foreground mb-8">
              If an account exists for <span className="text-foreground font-semibold">{email}</span>, we've sent a
              link to reset your password. The link expires in 1 hour.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-display font-bold uppercase mb-2">Forgot <span className="text-primary">Password</span></h1>
            <p className="text-muted-foreground mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-1"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : "Send Reset Link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
