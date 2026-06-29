import { useState, useMemo } from "react";
import { useClasses, useMemberStatus, useCheckIn, useMyCheckIns } from "@/hooks/use-boxing";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, Users, Activity, HeartPulse, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type Program = "recreation" | "rock_steady" | "kids";

const PROGRAMS: { id: Program; label: string; icon: typeof Activity; color: string; description: string }[] = [
  {
    id: "recreation",
    label: "Recreation",
    icon: Activity,
    color: "from-primary to-orange-500",
    description: "High-intensity workouts combining boxing technique with cardio conditioning.",
  },
  {
    id: "rock_steady",
    label: "Rock Steady",
    icon: HeartPulse,
    color: "from-pink-600 to-rose-500",
    description: "Empowering people with Parkinson's disease to fight back through non-contact boxing.",
  },
  {
    id: "kids",
    label: "Kids Class",
    icon: Users,
    color: "from-blue-600 to-sky-500",
    description: "Building discipline, confidence, and technique in a safe, supervised environment.",
  },
];

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type ClassRow = {
  id: number;
  name: string;
  category: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  instructor: string | null;
  duration: number;
  location: string | null;
  capacity: number;
};

function BookButton({
  cls,
  isAuthenticated,
  isActiveMember,
  alreadyBooked,
  openAuthModal,
}: {
  cls: ClassRow;
  isAuthenticated: boolean;
  isActiveMember: boolean;
  alreadyBooked: boolean;
  openAuthModal: () => void;
}) {
  const { mutateAsync: checkIn, isPending } = useCheckIn();
  const { toast } = useToast();

  if (!isAuthenticated) {
    return (
      <button
        onClick={openAuthModal}
        className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border border-border/50 rounded-lg py-2 hover:border-primary/50 hover:text-primary transition-all"
      >
        <Lock size={12} />
        Login to Book
      </button>
    );
  }

  if (!isActiveMember) {
    return (
      <Link href="/membership">
        <button className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-primary border border-primary/40 rounded-lg py-2 hover:bg-primary/10 transition-all">
          <Lock size={12} />
          Get Membership
        </button>
      </Link>
    );
  }

  if (alreadyBooked) {
    return (
      <div className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-green-500 border border-green-500/40 rounded-lg py-2 bg-green-500/10">
        <CheckCircle2 size={12} />
        Registered
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        try {
          await checkIn({ body: { classId: cls.id } });
          toast({ title: "Registered!", description: `You're signed up for ${cls.name}.` });
        } catch (err: any) {
          const msg = err?.response?.data?.error ?? "Could not register. Please try again.";
          toast({ title: "Error", description: msg, variant: "destructive" });
        }
      }}
      disabled={isPending}
      className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-primary to-orange-500 rounded-lg py-2 hover:opacity-90 transition-all disabled:opacity-60"
    >
      <Calendar size={12} />
      {isPending ? "Booking…" : "Register"}
    </button>
  );
}

function ClassCard({
  cls,
  isAuthenticated,
  isActiveMember,
  bookedClassIds,
  openAuthModal,
}: {
  cls: ClassRow;
  isAuthenticated: boolean;
  isActiveMember: boolean;
  bookedClassIds: Set<number>;
  openAuthModal: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-xl p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-display font-bold text-base text-white">{cls.name}</p>
          {cls.instructor && (
            <p className="text-xs text-muted-foreground mt-0.5">Instructor: {cls.instructor}</p>
          )}
        </div>
        <span className="text-xs text-primary font-bold whitespace-nowrap shrink-0">
          {formatTime(cls.startTime)}{cls.endTime ? ` – ${formatTime(cls.endTime)}` : ""}
        </span>
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>{cls.duration} min</span>
        <span>•</span>
        <span>Capacity: {cls.capacity}</span>
        {cls.location && <><span>•</span><span>{cls.location}</span></>}
      </div>
      <BookButton
        cls={cls}
        isAuthenticated={isAuthenticated}
        isActiveMember={isActiveMember}
        alreadyBooked={bookedClassIds.has(cls.id)}
        openAuthModal={openAuthModal}
      />
    </motion.div>
  );
}

export default function Classes() {
  const { data: rawClasses = [], isLoading, error } = useClasses();
  const { data: memberStatus } = useMemberStatus();
  const { data: myCheckIns } = useMyCheckIns();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [activeProgram, setActiveProgram] = useState<Program>("recreation");
  const [pageIdx, setPageIdx] = useState(0);
  const { toast } = useToast();

  const classes = rawClasses as unknown as ClassRow[];

  // Active membership: member status is returned as { isMember: boolean } from /members/status
  const isActiveMember = isAuthenticated && (memberStatus as any)?.isMember === true;

  const bookedClassIds = useMemo(() => {
    const ids = new Set<number>();
    if (Array.isArray(myCheckIns)) {
      for (const c of myCheckIns as any[]) ids.add(c.classId);
    }
    return ids;
  }, [myCheckIns]);

  const programClasses = useMemo(() => {
    return classes.filter(c => c.category === activeProgram);
  }, [classes, activeProgram]);

  const byDay = useMemo(() => {
    const map = new Map<number, ClassRow[]>();
    for (const d of DAY_ORDER) map.set(d, []);
    for (const c of programClasses) {
      if (c.dayOfWeek == null) continue;
      map.get(c.dayOfWeek)?.push(c);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    }
    return map;
  }, [programClasses]);

  const activeDays = DAY_ORDER.filter(d => (byDay.get(d) ?? []).length > 0);

  const pages: number[][] = [];
  for (let i = 0; i < activeDays.length; i += 2) {
    pages.push(activeDays.slice(i, i + 2));
  }

  // Reset pagination when program changes
  const handleProgramChange = (p: Program) => {
    setActiveProgram(p);
    setPageIdx(0);
  };

  const current = pages[pageIdx] ?? [];

  const currentProgramMeta = PROGRAMS.find(p => p.id === activeProgram)!;
  const Icon = currentProgramMeta.icon;

  return (
    <div className="min-h-screen pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-3 uppercase">
          Class <span className="text-primary">Schedule</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {isActiveMember
            ? "Register for your classes below. You must have an active membership to book."
            : "View the weekly schedule. Sign in and get a membership to register for classes."}
        </p>
      </div>

      {/* Membership gate banner */}
      {!isAuthenticated && (
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-primary shrink-0" />
            <div>
              <p className="font-bold text-sm">Login required to book classes</p>
              <p className="text-xs text-muted-foreground">You must be logged in with an active membership to register.</p>
            </div>
          </div>
          <button
            onClick={openAuthModal}
            className="shrink-0 text-sm font-bold bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Login / Sign Up
          </button>
        </div>
      )}

      {isAuthenticated && !isActiveMember && (
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-primary shrink-0" />
            <div>
              <p className="font-bold text-sm">Membership required to book classes</p>
              <p className="text-xs text-muted-foreground">Purchase a membership to register for any class. Terms & waiver are included in signup.</p>
            </div>
          </div>
          <Link href="/membership">
            <button className="shrink-0 text-sm font-bold bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
              Get Membership
            </button>
          </Link>
        </div>
      )}

      {/* Program Tabs */}
      <div className="flex flex-wrap gap-3 mb-10">
        {PROGRAMS.map(({ id, label, icon: PIcon, color }) => (
          <motion.button
            key={id}
            onClick={() => handleProgramChange(id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
              activeProgram === id
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : "bg-white/5 border border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            <PIcon size={16} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Program description */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentProgramMeta.color} flex items-center justify-center shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className="text-muted-foreground text-sm max-w-xl">{currentProgramMeta.description}</p>
      </div>

      {/* Schedule */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-border">
          <p className="text-destructive font-bold text-xl">Failed to load schedule</p>
        </div>
      ) : activeDays.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-border/30">
          <Icon size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-semibold">No classes scheduled for this program yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Check back soon or contact us for more info.</p>
        </div>
      ) : (
        <>
          {/* Pagination arrows */}
          {pages.length > 1 && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setPageIdx(p => Math.max(0, p - 1))}
                disabled={pageIdx === 0}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-muted-foreground">
                {current.map(d => DAY_FULL[d]).join(" & ")}
              </span>
              <button
                onClick={() => setPageIdx(p => Math.min(pages.length - 1, p + 1))}
                disabled={pageIdx >= pages.length - 1}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {current.map(day => {
              const dayClasses = byDay.get(day) ?? [];
              return (
                <div key={day}>
                  <div className="bg-gradient-to-r from-black to-black/80 border border-white/10 px-5 py-3 rounded-t-xl mb-3">
                    <h2 className="text-xl font-display font-bold tracking-wider text-white uppercase">
                      {DAY_FULL[day]}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {dayClasses.map(c => (
                      <ClassCard
                        key={c.id}
                        cls={c}
                        isAuthenticated={isAuthenticated}
                        isActiveMember={isActiveMember}
                        bookedClassIds={bookedClassIds}
                        openAuthModal={openAuthModal}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot pagination */}
          {pages.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageIdx(i)}
                  className={`rounded-full transition-all ${i === pageIdx ? "bg-primary w-6 h-2.5" : "bg-muted-foreground/30 w-2.5 h-2.5"}`}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Walk-in note */}
      <div className="mt-16 border-t border-border/30 pt-8 text-center text-sm text-muted-foreground">
        <p>First time? <Link href="/membership" className="text-primary hover:underline font-semibold">Sign up for a membership</Link> to register for classes online, or walk in and we'll get you set up at the front desk.</p>
      </div>
    </div>
  );
}
