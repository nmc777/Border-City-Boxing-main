import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Tab = "login" | "register" | "forgot";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, refreshUser } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("login");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch {
      toast({ title: "Error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Login failed", description: data.error, variant: "destructive" });
      } else {
        await refreshUser();
        closeAuthModal();
        setLoginForm({ email: "", password: "" });
        toast({ title: "Welcome back!", description: `Logged in as ${data.user.email}` });
      }
    } catch {
      toast({ title: "Error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.error, variant: "destructive" });
      } else {
        await refreshUser();
        closeAuthModal();
        setRegisterForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
        toast({ title: "Account created!", description: "Welcome to Border City Boxing." });
      }
    } catch {
      toast({ title: "Error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-tight">
            {tab === "login" ? "Sign In" : tab === "register" ? "Create Account" : "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        {tab !== "forgot" && (
          <div className="flex border border-border rounded-md overflow-hidden mb-2">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t === "login" ? "Log In" : "Register"}
              </button>
            ))}
          </div>
        )}

        {tab === "forgot" ? (
          forgotSent ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="font-semibold text-foreground">{forgotEmail}</span>,
                we've sent a password reset link. It will expire in 30 minutes.
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't get it? Check your spam folder, or wait a minute and try again.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { setTab("login"); setForgotSent(false); setForgotEmail(""); }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the email on your account and we'll send a reset link.
              </p>
              <div>
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  className="mt-1"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )
        ) : tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm">
              <button
                type="button"
                onClick={() => { setTab("forgot"); setForgotSent(false); }}
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                Forgot password?
              </button>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("register")}
                className="text-primary font-medium hover:underline"
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reg-first">First Name</Label>
                <Input
                  id="reg-first"
                  className="mt-1"
                  placeholder="First"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="reg-last">Last Name</Label>
                <Input
                  id="reg-last"
                  className="mt-1"
                  placeholder="Last"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="Min. 8 characters"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reg-confirm">Confirm Password</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="••••••••"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
