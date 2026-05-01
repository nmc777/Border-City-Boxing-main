import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCoachStatus, useCoachRegister } from "@/hooks/use-boxing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, KeyRound, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CoachPortal() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { data: coachStatus, isLoading } = useCoachStatus();
  const { mutate: register, isPending } = useCoachRegister();
  const { toast } = useToast();
  const [code, setCode] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-48 pb-20 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Lock className="w-12 h-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-2xl">Coach Portal</CardTitle>
            <CardDescription>You must be logged in to access the coach portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openAuthModal} className="w-full">Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (coachStatus?.isCoach) {
    return (
      <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase mb-4">
            Coach <span className="text-primary">Portal</span>
          </h1>
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 px-5 py-3 rounded-lg inline-flex">
            <ShieldCheck className="text-primary" size={20} />
            <p className="text-primary font-semibold">You are registered as a coach.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to use your coach access</CardTitle>
            <CardDescription>Your coach privileges are active across the site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-start p-4 bg-secondary/30 rounded-lg">
              <span className="w-8 h-8 bg-primary text-background font-bold rounded-full flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <p className="font-bold">Go to the Classes page</p>
                <p className="text-sm text-muted-foreground">Navigate to Classes from the top nav.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 bg-secondary/30 rounded-lg">
              <span className="w-8 h-8 bg-primary text-background font-bold rounded-full flex items-center justify-center flex-shrink-0">2</span>
              <div>
                <p className="font-bold">Sign In as Coach on any class</p>
                <p className="text-sm text-muted-foreground">Click "Sign In as Coach" on any class card to mark yourself as the coach on duty.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 bg-secondary/30 rounded-lg">
              <span className="w-8 h-8 bg-primary text-background font-bold rounded-full flex items-center justify-center flex-shrink-0">3</span>
              <div>
                <p className="font-bold">View the Roster</p>
                <p className="text-sm text-muted-foreground">Click "View Roster" to see who's signed up — first name, last name, and a total attending count at the bottom.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    register(
      { data: { code: code.trim() } },
      {
        onSuccess: () => {
          toast({ title: "Welcome, Coach!", description: "You now have coach access across the site." });
        },
        onError: (err: any) => {
          toast({
            title: "Registration Failed",
            description: err.message || "Invalid coach code. Please check with the club administrator.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen pt-48 pb-20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <KeyRound className="w-12 h-12 mx-auto text-primary mb-2" />
          <CardTitle className="text-2xl">Coach Registration</CardTitle>
          <CardDescription>
            Enter the coach access code provided by the club administrator to unlock coach features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">Coach Access Code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter your coach code"
                className="w-full px-4 py-2 rounded-md border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending || !code.trim()}>
              {isPending ? "Registering..." : "Register as Coach"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
