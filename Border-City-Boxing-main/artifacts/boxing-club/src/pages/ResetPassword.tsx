import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const token = new URLSearchParams(search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error ?? "Could not reset password.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      setDone(true);
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-display font-bold uppercase mb-3">Invalid Link</h1>
          <p className="text-muted-foreground mb-8">This reset link is missing or malformed. Please request a new one.</p>
          <Link href="/forgot-password"><Button>Request New Link</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {done ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={36} />
            </div>
            <h1 className="text-3xl font-display font-bold uppercase mb-3">Password Reset</h1>
            <p className="text-muted-foreground mb-8">Your password has been updated. You can now sign in with your new password.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-display font-bold uppercase mb-2">Reset <span className="text-primary">Password</span></h1>
            <p className="text-muted-foreground mb-6">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 size={16} className="animate-spin mr-2" /> Updating...</> : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
