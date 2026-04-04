import { useState } from "react";
import { useClasses, useBookClass, useCoachStatus, useCoachSignIn, useCoachSignOut, useClassRoster } from "@/hooks/use-boxing";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar as CalendarIcon, User, Users, ChevronDown, ChevronUp, ShieldCheck, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { BoxingClassCategory } from "@workspace/api-client-react/src/generated/api.schemas";

function RosterPanel({ classId, onClose }: { classId: number; onClose: () => void }) {
  const { data: roster, isLoading } = useClassRoster(classId, true);

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
          <Users size={14} />
          Class Roster
        </h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronUp size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-6 bg-secondary/50 animate-pulse rounded" />
          ))}
        </div>
      ) : !roster ? (
        <p className="text-muted-foreground text-sm">Failed to load roster.</p>
      ) : (
        <>
          {roster.coachesSignedIn.length > 0 && (
            <div className="mb-3 pb-3 border-b border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldCheck size={11} /> Coaches On Duty
              </p>
              {roster.coachesSignedIn.map((name, i) => (
                <p key={i} className="text-sm font-semibold text-primary">{name}</p>
              ))}
            </div>
          )}

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {roster.members.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No members booked yet.</p>
            ) : (
              roster.members.map((member, i) => (
                <div key={member.id} className="flex items-center gap-2 py-1">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="text-sm font-medium">
                    {[member.firstName, member.lastName].filter(Boolean).join(" ") || "Member"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Attending</span>
            <span className="text-lg font-bold text-primary">{roster.totalAttending}</span>
          </div>
        </>
      )}
    </div>
  );
}

function ClassCard({ cls, isAuthenticated, isCoach, login }: {
  cls: any;
  isAuthenticated: boolean;
  isCoach: boolean;
  login: () => void;
}) {
  const { mutate: bookClass, isPending: isBooking } = useBookClass();
  const { mutate: coachSignIn, isPending: isSigningIn } = useCoachSignIn(cls.id);
  const { mutate: coachSignOut, isPending: isSigningOut } = useCoachSignOut(cls.id);
  const { toast } = useToast();
  const [showRoster, setShowRoster] = useState(false);

  const { data: roster } = useClassRoster(cls.id, isCoach);
  const coachIsSignedIn = isCoach && roster?.coachesSignedIn?.some(
    name => name && name.length > 0
  );

  const handleBook = () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to book a class.", variant: "destructive" });
      login();
      return;
    }
    bookClass(
      { data: { classId: cls.id } },
      {
        onSuccess: () => toast({ title: "Class Booked!", description: `You're confirmed for ${cls.name}.` }),
        onError: (err: any) => toast({ title: "Booking Failed", description: err.message || "Failed to book. It might be full or already booked.", variant: "destructive" }),
      }
    );
  };

  const handleCoachSignIn = () => {
    coachSignIn(
      { classId: cls.id },
      {
        onSuccess: () => toast({ title: "Signed In", description: `You're signed in as coach for ${cls.name}.` }),
        onError: (err: any) => toast({ title: "Sign In Failed", description: err.message || "Already signed in.", variant: "destructive" }),
      }
    );
  };

  const handleCoachSignOut = () => {
    coachSignOut(
      { classId: cls.id },
      {
        onSuccess: () => toast({ title: "Signed Out", description: `Removed from ${cls.name}.` }),
        onError: () => toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" }),
      }
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-border/50 bg-secondary/20">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={cls.spotsRemaining > 0 ? "default" : "destructive"}>
            {cls.spotsRemaining > 0 ? `${cls.spotsRemaining} Spots Left` : "FULL"}
          </Badge>
          <span className="font-bold text-lg">{cls.duration} min</span>
        </div>
        <CardTitle className="text-3xl mt-2">{cls.name}</CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-4 flex-1">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <CalendarIcon size={16} className="text-primary" />
          </div>
          <span className="font-medium text-foreground">{cls.schedule}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span>Coach: <span className="font-medium text-foreground">{cls.instructor}</span></span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <MapPin size={16} className="text-primary" />
          </div>
          <span>{cls.location}</span>
        </div>
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground line-clamp-3">{cls.description}</p>
        </div>

        {isCoach && showRoster && (
          <RosterPanel classId={cls.id} onClose={() => setShowRoster(false)} />
        )}
      </CardContent>

      <CardFooter className="pt-2 flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={cls.spotsRemaining === 0 || isBooking}
          onClick={handleBook}
        >
          {isBooking ? "Booking..." : cls.spotsRemaining === 0 ? "Waitlist Only" : "Book Spot"}
        </Button>

        {isCoach && (
          <div className="flex gap-2 w-full">
            {coachIsSignedIn ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleCoachSignOut}
                disabled={isSigningOut}
              >
                <LogOut size={14} className="mr-1" />
                {isSigningOut ? "Signing Out..." : "Sign Out (Coach)"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleCoachSignIn}
                disabled={isSigningIn}
              >
                <LogIn size={14} className="mr-1" />
                {isSigningIn ? "Signing In..." : "Sign In as Coach"}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-muted-foreground hover:text-foreground"
              onClick={() => setShowRoster(v => !v)}
            >
              <Users size={14} className="mr-1" />
              {showRoster ? "Hide" : "View Roster"}
              {!showRoster && roster ? ` (${roster.totalAttending})` : ""}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function Classes() {
  const { data: classes, isLoading, error } = useClasses();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { data: coachStatus } = useCoachStatus();
  const isCoach = isAuthenticated && coachStatus?.isCoach === true;

  const [activeTab, setActiveTab] = useState<BoxingClassCategory>("recreation");

  const categories = [
    { id: "recreation", label: "Recreation" },
    { id: "kids", label: "Kids Class" },
    { id: "rock_steady", label: "Rock Steady" },
  ];

  const filteredClasses = classes?.filter(c => c.category === activeTab) || [];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase">
          Training <span className="text-primary">Schedule</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Find your class, reserve your spot, and get ready to work.
        </p>
        {isCoach && (
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-lg">
            <ShieldCheck size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Coach View — Sign in to classes and view rosters below</span>
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 hide-scrollbar border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as BoxingClassCategory)}
            className={`whitespace-nowrap px-6 py-3 font-display font-bold text-lg tracking-wider uppercase transition-all
              ${activeTab === cat.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-card/50 animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <p className="text-destructive font-bold text-xl">Failed to load classes</p>
          <p className="text-muted-foreground mt-2">Please try again later.</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-24 bg-card/30 rounded-xl border border-border/50 border-dashed">
          <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-bold">No classes scheduled</p>
          <p className="text-muted-foreground mt-2">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClasses.map((cls) => (
              <motion.div
                key={cls.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ClassCard
                  cls={cls}
                  isAuthenticated={isAuthenticated}
                  isCoach={isCoach}
                  login={openAuthModal}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
