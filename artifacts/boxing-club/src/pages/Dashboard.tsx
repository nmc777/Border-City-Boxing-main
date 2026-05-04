import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";

type MembershipResponse = {
  membership: {
    id: number;
    plan: "single" | "family";
    status: "pending" | "active" | "cancelled";
    termMonths: number;
    priceCents: number;
    firstName: string;
    lastName: string;
    dob: string;
    startedAt: string | null;
    expiresAt: string | null;
  } | null;
  familyMembers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    dob: string;
  }>;
  isActive: boolean;
  status: string;
  expiresAt: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [data, setData] = useState<MembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetch("/api/me/membership", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const m = data?.membership;
  const isActive = data?.isActive ?? false;
  const days = daysUntil(data?.expiresAt ?? null);
  const expiringSoon = isActive && days !== null && days <= 14;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 uppercase">
          Member <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
        </p>
      </motion.div>

      {loading ? (
        <div className="h-48 bg-card/50 animate-pulse rounded-xl" />
      ) : !m ? (
        <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-display font-bold uppercase mb-2">No active membership</h2>
          <p className="text-muted-foreground mb-6">
            Sign up for a 1, 3, or 6 month plan to start booking classes.
          </p>
          <Button onClick={() => navigate("/membership")} size="lg">
            Become a Member
          </Button>
        </div>
      ) : (
        <motion.div
          className="space-y-6"
          variants={{
            container: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
            item: {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            },
          }}
          initial="container"
          animate="container"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              className="md:col-span-2 bg-card border border-border/50 rounded-xl p-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(255, 46, 46, 0.1)" }}
            >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Membership Status</p>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <>
                      <ShieldCheck className="text-green-400" size={22} />
                      <span className="text-2xl font-display font-bold text-green-400 uppercase">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="text-destructive" size={22} />
                      <span className="text-2xl font-display font-bold text-destructive uppercase">
                        {m.status === "cancelled" ? "Cancelled" : "Expired"}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Plan</p>
                <p className="text-xl font-bold capitalize">{m.plan}</p>
                <p className="text-xs text-muted-foreground">{m.termMonths} month{m.termMonths > 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Started
                </p>
                <p className="font-semibold">{formatDate(m.startedAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock size={12} /> Expires
                </p>
                <p className="font-semibold">{formatDate(m.expiresAt)}</p>
                {days !== null && isActive && (
                  <p className={`text-xs mt-0.5 ${expiringSoon ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {days > 0 ? `${days} day${days === 1 ? "" : "s"} remaining` : "Expires today"}
                  </p>
                )}
              </div>
            </div>

            {expiringSoon && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md flex items-start gap-3">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-semibold text-yellow-500 text-sm">Membership expires soon</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Renew now to keep booking classes without interruption.
                  </p>
                </div>
              </div>
            )}

            {!isActive && (
              <div className="mt-6">
                <Button onClick={() => navigate("/membership")} size="lg" className="w-full">
                  Renew Membership
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-card border border-border/50 rounded-xl p-6"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
            }}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(255, 46, 46, 0.1)" }}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Member</p>
            <p className="text-lg font-bold">{m.firstName} {m.lastName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Date of Birth</p>
              <p className="font-semibold">{formatDate(m.dob)}</p>
            </div>
          </motion.div>

          {m.plan === "family" && data?.familyMembers && data.familyMembers.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h2 className="text-xl font-display font-bold uppercase mb-4">Family Members</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.familyMembers.map((member) => (
                  <div key={member.id} className="border border-border/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Member</p>
                    <p className="font-bold text-lg">{member.firstName} {member.lastName}</p>
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                      <p className="text-sm font-semibold">{formatDate(member.dob)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </motion.div>
      )}
    </motion.div>
  );
}
