import { useState, useMemo } from "react";
import { useClasses } from "@/hooks/use-boxing";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "";
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${m.toString().padStart(2, "0")}${ampm}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
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

function ClassInfoRow({ cls }: { cls: ClassRow }) {
  return (
    <div className="py-3">
      <p className="font-bold text-sm md:text-base">{formatTimeRange(cls.startTime, cls.endTime)}</p>
      <p className="text-muted-foreground text-sm md:text-base truncate">{cls.name}</p>
      {cls.instructor && <p className="text-xs text-muted-foreground/70 mt-0.5">Instructor: {cls.instructor}</p>}
      <p className="text-xs text-muted-foreground/70">{cls.duration} min • Capacity: {cls.capacity}</p>
      {cls.location && <p className="text-xs text-muted-foreground/70">{cls.location}</p>}
    </div>
  );
}

function DayColumn({ day, classes }: {
  day: number;
  classes: ClassRow[];
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-black text-white px-6 py-4 mb-4">
        <h2 className="text-2xl font-display font-bold tracking-wider">{DAY_LABELS[day]}</h2>
      </div>
      <div className="px-2 md:px-4">
        <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">TIME | CLASSES</p>
        {classes.length === 0 ? (
          <p className="text-muted-foreground text-sm italic py-3">Rest day.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {classes.map(c => (
              <ClassInfoRow key={c.id} cls={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Classes() {
  const { data: rawClasses, isLoading, error } = useClasses();
  const [pageIdx, setPageIdx] = useState(0);

  const classes = (rawClasses ?? []) as unknown as ClassRow[];

  const byDay = useMemo(() => {
    const map = new Map<number, ClassRow[]>();
    for (const d of DAY_ORDER) map.set(d, []);
    for (const c of classes) {
      if (c.dayOfWeek == null) continue;
      const arr = map.get(c.dayOfWeek);
      if (arr) arr.push(c);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    }
    return map;
  }, [classes]);

  // Pages of 2 days each
  const pages: number[][] = [];
  for (let i = 0; i < DAY_ORDER.length; i += 2) {
    pages.push(DAY_ORDER.slice(i, i + 2));
  }
  const current = pages[pageIdx] ?? [];

  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase">
          Class <span className="text-primary">Schedule</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Check out the weekly schedule. Sign in at the door to attend.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setPageIdx(p => Math.max(0, p - 1))}
          disabled={pageIdx === 0}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition"
          aria-label="Previous days"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => setPageIdx(p => Math.min(pages.length - 1, p + 1))}
          disabled={pageIdx >= pages.length - 1}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition"
          aria-label="Next days"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-card/50 animate-pulse rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <p className="text-destructive font-bold text-xl">Failed to load schedule</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {current.map(d => (
            <DayColumn
              key={d}
              day={d}
              classes={byDay.get(d) ?? []}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-8">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setPageIdx(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${i === pageIdx ? "bg-primary" : "bg-muted-foreground/30"}`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
