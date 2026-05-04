import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useAdminStatus,
  useAdminRegister,
  useAdminUsers,
  useAdminClasses,
  useAdminOverview,
  useToggleMembership,
  useToggleCoach,
  useDeleteClass,
  useCreateClass,
} from "@/hooks/use-boxing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Users,
  Dumbbell,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  LayoutDashboard,
  Settings,
  CalendarClock,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type Tab = "overview" | "users" | "classes" | "schedule" | "memberships" | "attendance";

type AttendancePerson = { firstName: string | null; lastName: string | null; email: string | null };
type AttendanceClass = {
  classId: number;
  className: string;
  schedule: string;
  capacity: number;
  bookingsCount: number;
  bookings: AttendancePerson[];
  attendanceCount: number;
  attendance: AttendancePerson[];
  walkInsCount: number;
  walkIns: AttendancePerson[];
};
type AttendanceResponse = { date: string; classes: AttendanceClass[] };

type AdminMembership = {
  id: number;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  plan: "single" | "family";
  termMonths: number;
  priceCents: number;
  status: "active" | "expired" | "cancelled" | "pending";
  startedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(status: AdminMembership["status"]): string {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-400 border-transparent";
    case "expired":
      return "bg-yellow-500/20 text-yellow-400 border-transparent";
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-transparent";
    default:
      return "bg-muted text-muted-foreground border-transparent";
  }
}

export default function AdminPortal() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: adminStatus, isLoading: isAdminLoading } = useAdminStatus();
  const { data: overview } = useAdminOverview();
  const { data: users, isLoading: isUsersLoading } = useAdminUsers();
  const { data: classes, isLoading: isClassesLoading } = useAdminClasses();
  const { mutate: registerAdmin, isPending: isRegistering } = useAdminRegister();
  const { mutate: toggleMembership, isPending: isTogglingMembership } = useToggleMembership();
  const { mutate: toggleCoach, isPending: isTogglingCoach } = useToggleCoach();
  const { mutate: deleteClass, isPending: isDeletingClass } = useDeleteClass();
  const { mutate: createClass, isPending: isCreatingClass } = useCreateClass();
  const { toast } = useToast();

  const [adminCode, setAdminCode] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [membershipFilter, setMembershipFilter] = useState<"all" | "active" | "expired" | "cancelled">("expired");
  const [attendanceDate, setAttendanceDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);

  const { data: attendance, isLoading: isAttendanceLoading } = useQuery<AttendanceResponse>({
    queryKey: ["admin-attendance", attendanceDate],
    queryFn: async () => {
      const res = await fetch(`/api/admin/attendance?date=${attendanceDate}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load attendance");
      return res.json();
    },
    enabled: adminStatus?.isAdmin === true && activeTab === "attendance",
    retry: false,
  });

  const { data: memberships, isLoading: isMembershipsLoading } = useQuery<AdminMembership[]>({
    queryKey: ["admin-memberships"],
    queryFn: async () => {
      const res = await fetch("/api/admin/memberships", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load memberships");
      return res.json();
    },
    enabled: adminStatus?.isAdmin === true,
    retry: false,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    category: "recreation" as "kids" | "recreation" | "rock_steady",
    instructor: "",
    description: "",
    schedule: "",
    duration: 60,
    capacity: 20,
    location: "Main Gym",
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isAuthLoading, setLocation]);

  const isAdmin = adminStatus?.isAdmin === true;

  if (isAuthLoading || isAdminLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-48 pb-20 px-4 max-w-lg mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight">
            Admin <span className="text-primary">Portal</span>
          </h1>
          <p className="text-muted-foreground mt-2">Enter your admin access code to continue.</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display uppercase">
              <Settings size={20} className="text-primary" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminCode">Admin Code</Label>
              <Input
                id="adminCode"
                type="password"
                placeholder="Enter your admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              disabled={!adminCode || isRegistering}
              onClick={() =>
                registerAdmin(
                  { data: { code: adminCode } },
                  {
                    onSuccess: () =>
                      toast({ title: "Admin access granted", description: "Welcome, Admin." }),
                    onError: () =>
                      toast({
                        title: "Invalid code",
                        description: "The code you entered is incorrect.",
                        variant: "destructive",
                      }),
                  }
                )
              }
            >
              {isRegistering ? "Verifying..." : "Submit Code"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "memberships", label: "Memberships", icon: <CalendarClock size={16} /> },
    { id: "attendance", label: "Attendance", icon: <ClipboardList size={16} /> },
    { id: "classes", label: "Classes", icon: <Dumbbell size={16} /> },
    { id: "schedule", label: "Schedule", icon: <Plus size={16} /> },
  ];

  const filteredMemberships = (memberships ?? []).filter((m) =>
    membershipFilter === "all" ? true : m.status === membershipFilter,
  );
  const counts = (memberships ?? []).reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleToggleMembership = (userId: string, currentlyMember: boolean) => {
    toggleMembership(
      { userId, data: { enabled: !currentlyMember } },
      {
        onSuccess: () =>
          toast({
            title: currentlyMember ? "Membership revoked" : "Membership granted",
            description: currentlyMember
              ? "User is no longer a member."
              : "User is now an active member.",
          }),
        onError: () =>
          toast({ title: "Error", description: "Failed to update membership.", variant: "destructive" }),
      }
    );
  };

  const handleToggleCoach = (userId: string, currentlyCoach: boolean) => {
    toggleCoach(
      { userId, data: { enabled: !currentlyCoach } },
      {
        onSuccess: () =>
          toast({
            title: currentlyCoach ? "Coach role revoked" : "Coach role granted",
          }),
        onError: () =>
          toast({ title: "Error", description: "Failed to update coach role.", variant: "destructive" }),
      }
    );
  };

  const handleDeleteClass = (classId: number, className: string) => {
    if (!confirm(`Delete "${className}"? This will also cancel all bookings for this class.`)) return;
    deleteClass(
      { classId },
      {
        onSuccess: () => toast({ title: "Class deleted", description: `"${className}" has been removed.` }),
        onError: () =>
          toast({ title: "Error", description: "Failed to delete class.", variant: "destructive" }),
      }
    );
  };

  const handleCreateClass = () => {
    createClass(
      { data: newClass },
      {
        onSuccess: () => {
          toast({ title: "Class created", description: `"${newClass.name}" has been added.` });
          setShowCreateForm(false);
          setNewClass({
            name: "",
            category: "recreation",
            instructor: "",
            description: "",
            schedule: "",
            duration: 60,
            capacity: 20,
            location: "Main Gym",
          });
        },
        onError: () =>
          toast({ title: "Error", description: "Failed to create class.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">
          Admin <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-2">Manage members, coaches, and class schedules.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Members", value: overview?.totalMembers ?? 0, color: "text-green-400" },
              { label: "Coaches", value: overview?.totalCoaches ?? 0, color: "text-blue-400" },
              { label: "Admins", value: overview?.totalAdmins ?? 0, color: "text-primary" },
              { label: "Classes", value: overview?.totalClasses ?? 0, color: "text-yellow-400" },
              { label: "Active Bookings", value: overview?.totalActiveBookings ?? 0, color: "text-purple-400" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="pt-6 pb-4 text-center">
                  <div className={`text-4xl font-display font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isUsersLoading ? (
            <div className="flex justify-center pt-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {users?.length ?? 0} registered users
              </p>
              {users?.map((user: any) => (
                <Card key={user.id} className="border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold shrink-0">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                          {user.firstName || ""} {user.lastName || ""}
                          {!user.firstName && !user.lastName && (
                            <span className="text-muted-foreground text-sm">No name</span>
                          )}
                          {user.isAdmin && (
                            <Badge className="bg-primary/20 text-primary border-transparent text-xs">
                              Admin
                            </Badge>
                          )}
                          {user.isCoach && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-transparent text-xs">
                              Coach
                            </Badge>
                          )}
                          {user.isMember && (
                            <Badge className="bg-green-500/20 text-green-400 border-transparent text-xs">
                              Member
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isTogglingMembership}
                        onClick={() => handleToggleMembership(user.id, user.isMember)}
                        className={user.isMember ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-green-500/40 text-green-400 hover:bg-green-500/10"}
                      >
                        {user.isMember ? (
                          <><UserX size={14} className="mr-1" /> Revoke</>
                        ) : (
                          <><UserCheck size={14} className="mr-1" /> Grant Member</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isTogglingCoach}
                        onClick={() => handleToggleCoach(user.id, user.isCoach)}
                        className={user.isCoach ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-blue-500/40 text-blue-400 hover:bg-blue-500/10"}
                      >
                        {user.isCoach ? (
                          <><ShieldOff size={14} className="mr-1" /> Remove Coach</>
                        ) : (
                          <><ShieldCheck size={14} className="mr-1" /> Make Coach</>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Memberships Tab */}
      {activeTab === "memberships" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Filter pills — defaults to expired, since that's the most actionable view. */}
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              { id: "expired", label: "Expired", count: counts.expired ?? 0 },
              { id: "active", label: "Active", count: counts.active ?? 0 },
              { id: "cancelled", label: "Cancelled", count: counts.cancelled ?? 0 },
              { id: "all", label: "All", count: memberships?.length ?? 0 },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setMembershipFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                  membershipFilter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label} <span className="ml-1 opacity-70">({f.count})</span>
              </button>
            ))}
          </div>

          {isMembershipsLoading ? (
            <div className="flex justify-center pt-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMemberships.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No memberships in this view.
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop / tablet: real table. Hidden on mobile. */}
              <div className="hidden md:block border border-border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Name</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Email</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Plan</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Term</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Status</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Started</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Expires</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredMemberships.map((m) => (
                        <tr key={m.id} className="hover:bg-secondary/30">
                          <td className="px-4 py-3 font-semibold">{m.firstName} {m.lastName}</td>
                          <td className="px-4 py-3 text-muted-foreground break-all">{m.userEmail}</td>
                          <td className="px-4 py-3 capitalize">{m.plan}</td>
                          <td className="px-4 py-3">{m.termMonths} mo</td>
                          <td className="px-4 py-3">
                            <Badge className={`${statusBadgeClass(m.status)} text-xs capitalize`}>
                              {m.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{fmtDate(m.startedAt)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{fmtDate(m.expiresAt)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            ${(m.priceCents / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile: stacked cards. Tables are unreadable on phones. */}
              <div className="md:hidden space-y-3">
                {filteredMemberships.map((m) => (
                  <Card key={m.id} className="border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-muted-foreground break-all">{m.userEmail}</p>
                        </div>
                        <Badge className={`${statusBadgeClass(m.status)} text-xs capitalize shrink-0`}>
                          {m.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider mb-0.5">Plan</p>
                          <p className="capitalize">{m.plan} — {m.termMonths} mo</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground uppercase tracking-wider mb-0.5">Paid</p>
                          <p className="tabular-nums">${(m.priceCents / 100).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider mb-0.5">Started</p>
                          <p>{fmtDate(m.startedAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground uppercase tracking-wider mb-0.5">Expires</p>
                          <p>{fmtDate(m.expiresAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Date picker — defaults to today, can scrub backwards */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Label htmlFor="attendance-date" className="text-sm uppercase tracking-wider text-muted-foreground">
              Date
            </Label>
            <Input
              id="attendance-date"
              type="date"
              className="w-auto"
              value={attendanceDate}
              onChange={(e) => {
                setAttendanceDate(e.target.value);
                setExpandedClassId(null);
              }}
              max={new Date().toISOString().slice(0, 10)}
            />
            <button
              onClick={() => {
                setAttendanceDate(new Date().toISOString().slice(0, 10));
                setExpandedClassId(null);
              }}
              className="text-xs uppercase tracking-wider text-primary hover:underline"
            >
              Today
            </button>
          </div>

          {isAttendanceLoading ? (
            <div className="flex justify-center pt-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (attendance?.classes ?? []).length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No classes configured.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(attendance?.classes ?? []).map((cls) => {
                const isOpen = expandedClassId === cls.classId;
                const totalShowedUp = cls.attendanceCount + cls.walkInsCount;
                const fillPct = cls.capacity > 0 ? Math.min(100, Math.round((totalShowedUp / cls.capacity) * 100)) : 0;
                return (
                  <Card key={cls.classId} className="border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedClassId(isOpen ? null : cls.classId)}
                      className="w-full text-left p-4 sm:px-6 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {isOpen ? (
                            <ChevronDown size={18} className="text-muted-foreground mt-1 shrink-0" />
                          ) : (
                            <ChevronRight size={18} className="text-muted-foreground mt-1 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h3 className="font-display font-bold uppercase truncate">{cls.className}</h3>
                            <p className="text-xs text-muted-foreground truncate">{cls.schedule}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
                          <Badge className="bg-blue-500/20 text-blue-400 border-transparent text-xs">
                            Online: {cls.bookingsCount}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 border-transparent text-xs">
                            Walk-in: {cls.walkInsCount}
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 border-transparent text-xs">
                            Online + Showed: {cls.attendanceCount}
                          </Badge>
                        </div>
                      </div>

                      {/* Fill bar — total who showed up vs capacity */}
                      <div className="mt-3 ml-7">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Showed up: {totalShowedUp} / {cls.capacity}</span>
                          <span className="opacity-50">·</span>
                          <span>{fillPct}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border bg-background/40 px-4 sm:px-6 py-4 grid gap-6 md:grid-cols-3">
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-bold text-blue-400 mb-2">
                            Online signups ({cls.bookingsCount})
                          </h4>
                          {cls.bookings.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No bookings.</p>
                          ) : (
                            <ul className="space-y-1.5 text-sm">
                              {cls.bookings.map((p, i) => (
                                <li key={i}>
                                  <p className="truncate">{p.firstName ?? ""} {p.lastName ?? ""}</p>
                                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400 mb-2">
                            Walked in — no booking ({cls.walkInsCount})
                          </h4>
                          {cls.walkIns.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No walk-ins this date.</p>
                          ) : (
                            <ul className="space-y-1.5 text-sm">
                              {cls.walkIns.map((p, i) => (
                                <li key={i}>
                                  <p className="truncate">{p.firstName} {p.lastName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-bold text-green-400 mb-2">
                            Online + showed up ({cls.attendanceCount})
                          </h4>
                          {cls.attendance.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No member check-ins this date.</p>
                          ) : (
                            <ul className="space-y-1.5 text-sm">
                              {cls.attendance.map((p, i) => (
                                <li key={i}>
                                  <p className="truncate">{p.firstName ?? ""} {p.lastName ?? ""}</p>
                                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isClassesLoading ? (
            <div className="flex justify-center pt-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {classes?.map((cls: any) => (
                <Card key={cls.id} className="border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-display font-bold uppercase">{cls.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {cls.category.replace("_", " ")}
                        </Badge>
                        <Badge className="bg-primary/20 text-primary border-transparent text-xs">
                          {cls.enrollmentCount}/{cls.capacity} enrolled
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cls.schedule} &bull; {cls.instructor} &bull; {cls.duration} min &bull; {cls.location}
                      </p>
                      {cls.coachesSignedIn.length > 0 && (
                        <p className="text-xs text-blue-400 mt-1">
                          Coaches on duty: {cls.coachesSignedIn.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isDeletingClass}
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Schedule (Create Class) Tab */}
      {activeTab === "schedule" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold uppercase">Create New Class</h2>
          </div>

          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Class Name</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Advanced Boxing"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={newClass.category}
                    onValueChange={(v) => setNewClass({ ...newClass, category: v as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="recreation">Recreation</SelectItem>
                      <SelectItem value="rock_steady">Rock Steady</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Instructor</Label>
                  <Input
                    className="mt-1"
                    placeholder="Coach name"
                    value={newClass.instructor}
                    onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Input
                    className="mt-1"
                    placeholder="Brief description of the class"
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Schedule</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Mon/Wed/Fri 6:00 PM"
                    value={newClass.schedule}
                    onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    value={newClass.duration}
                    onChange={(e) => setNewClass({ ...newClass, duration: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Capacity</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input
                    className="mt-1"
                    placeholder="Main Gym"
                    value={newClass.location}
                    onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                disabled={
                  isCreatingClass ||
                  !newClass.name ||
                  !newClass.instructor ||
                  !newClass.description ||
                  !newClass.schedule
                }
                onClick={handleCreateClass}
              >
                <Plus size={16} className="mr-2" />
                {isCreatingClass ? "Creating..." : "Create Class"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
