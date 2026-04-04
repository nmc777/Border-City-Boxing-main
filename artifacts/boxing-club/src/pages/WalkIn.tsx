import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin, User, ChevronRight, RotateCcw } from "lucide-react";

interface BoxingClass {
  id: number;
  name: string;
  category: string;
  instructor: string;
  schedule: string;
  duration: number;
  location: string;
  capacity: number;
}

type Step = "select-class" | "enter-info" | "success";

export default function WalkIn() {
  const [step, setStep] = useState<Step>("select-class");
  const [classes, setClasses] = useState<BoxingClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState<BoxingClass | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoResetTimer, setAutoResetTimer] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => {
        setClasses(Array.isArray(data) ? data : data.classes ?? []);
        setLoadingClasses(false);
      })
      .catch(() => setLoadingClasses(false));
  }, []);

  useEffect(() => {
    if (step === "success") {
      const t = window.setTimeout(() => handleReset(), 12000);
      setAutoResetTimer(t);
      return () => window.clearTimeout(t);
    }
  }, [step]);

  function handleReset() {
    if (autoResetTimer) window.clearTimeout(autoResetTimer);
    setStep("select-class");
    setSelectedClass(null);
    setForm({ firstName: "", lastName: "", email: "" });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/walkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, classId: selectedClass.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed. Please try again.");
      } else {
        setStep("success");
      }
    } catch {
      setError("Could not reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryColors: Record<string, string> = {
    kids: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    recreation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    rock_steady: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center font-bold text-background text-sm">BC</div>
          <div>
            <p className="font-display font-bold uppercase text-lg leading-none">Border City Boxing</p>
            <p className="text-xs text-muted-foreground">Walk-In Class Sign-In</p>
          </div>
        </div>
        {step !== "select-class" && (
          <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw size={14} />
            Start Over
          </button>
        )}
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        {step === "select-class" && (
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase mb-2">
                Welcome <span className="text-primary">In</span>
              </h1>
              <p className="text-muted-foreground text-lg">Select the class you're attending today</p>
            </div>

            {loadingClasses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-secondary/30 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No classes available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => { setSelectedClass(cls); setStep("enter-info"); }}
                    className="text-left rounded-xl border border-border/50 bg-card p-5 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[cls.category] ?? "bg-secondary text-muted-foreground"}`}>
                        {cls.category.replace("_", " ").toUpperCase()}
                      </span>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{cls.name}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <User size={12} /> {cls.instructor}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock size={12} /> {cls.schedule} · {cls.duration} min
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <MapPin size={12} /> {cls.location}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "enter-info" && selectedClass && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-display font-bold uppercase mb-1">
                Sign <span className="text-primary">In</span>
              </h1>
              <p className="text-muted-foreground">Enter your info to sign in to</p>
              <p className="font-bold text-lg mt-1">{selectedClass.name}</p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{selectedClass.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedClass.schedule} · {selectedClass.instructor}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Jane"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Smith"
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in…" : "Sign In to Class"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "success" && selectedClass && (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={40} />
            </div>
            <h1 className="text-4xl font-display font-bold uppercase mb-2">
              You're <span className="text-primary">In!</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-1">
              Welcome, <span className="text-foreground font-semibold">{form.firstName}</span>
            </p>
            <p className="text-muted-foreground mb-6">
              Signed in to <span className="text-foreground font-semibold">{selectedClass.name}</span>
            </p>
            <div className="p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground mb-6">
              Enjoy your class! This screen will reset automatically.
            </div>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw size={14} />
              Sign In Another Person
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
