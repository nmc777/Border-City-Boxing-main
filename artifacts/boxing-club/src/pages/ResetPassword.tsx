import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        return;
      }
      setSuccess(true);
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
    } catch {
      setError("Could not reach server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-48 pb-20 px-4 max-w-md mx-auto">
        <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h1 className="text-2xl font-display font-bold uppercase mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">This reset link is missing a token.</p>
          <Button onClick={() => navigate("/")} className="w-full">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-48 pb-20 px-4 max-w-md mx-auto">
      <div className="bg-card border border-border/50 rounded-xl p-8">
        {success ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold uppercase mb-2">Password Updated</h1>
            <p className="text-muted-foreground mb-6">You can now sign in with your new password.</p>
            <Button onClick={() => navigate("/")} className="w-full">Go to Sign In</Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-display font-bold uppercase mb-1">Reset Password</h1>
            <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
