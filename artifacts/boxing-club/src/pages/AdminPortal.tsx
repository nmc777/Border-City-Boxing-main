import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
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
} from "lucide-react";

type Tab = "overview" | "users" | "classes" | "schedule";

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
      <div className="min-h-screen pt-28 pb-20 px-4 max-w-lg mx-auto">
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
                  { code: adminCode },
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
    { id: "classes", label: "Classes", icon: <Dumbbell size={16} /> },
    { id: "schedule", label: "Schedule", icon: <Plus size={16} /> },
  ];

  const handleToggleMembership = (userId: string, currentlyMember: boolean) => {
    toggleMembership(
      { userId, enabled: !currentlyMember },
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
      { userId, enabled: !currentlyCoach },
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
      { ...newClass },
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
              {users?.map((user) => (
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

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isClassesLoading ? (
            <div className="flex justify-center pt-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {classes?.map((cls) => (
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
