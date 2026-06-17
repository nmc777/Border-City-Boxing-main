import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCoachStatus, useAdminStatus } from "@/hooks/use-boxing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { data: coachStatus } = useCoachStatus();
  const { data: adminStatus } = useAdminStatus();
  const isCoach = isAuthenticated && coachStatus?.isCoach === true;
  const isAdmin = isAuthenticated && adminStatus?.isAdmin === true;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: { href: string; label: string; icon?: React.ReactNode }[] = [
    { href: "/", label: "Home" },
    { href: "/classes", label: "Classes" },
    { href: "/membership", label: "Membership" },
  ];

  if (isAuthenticated) {
    navLinks.push({ href: "/bookings", label: "My Bookings" });
  }

  if (isCoach) {
    navLinks.push({ href: "/coach", label: "Coach Portal", icon: <ShieldCheck size={13} /> });
  }

  if (isAdmin) {
    navLinks.push({ href: "/admin", label: "Admin", icon: <LayoutDashboard size={13} /> });
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm transform -skew-x-12 group-hover:scale-110 transition-transform duration-300">
              <span className="font-display font-bold text-background text-xl">BC</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-wider text-foreground">
              BORDER CITY <span className="text-primary">BOXING</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-bold uppercase tracking-wider transition-colors duration-200 hover:text-primary relative py-2 flex items-center gap-1",
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.icon}
                  {link.label}
                  {location === link.href && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full border border-primary/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground leading-none">
                        {user?.firstName || user?.email}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isAdmin && (
                          <span className="text-xs text-primary font-semibold flex items-center gap-1">
                            <LayoutDashboard size={10} /> Admin
                          </span>
                        )}
                        {isCoach && !isAdmin && (
                          <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                            <ShieldCheck size={10} /> Coach
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={openAuthModal}>
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border absolute top-20 w-full shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-4 text-base font-bold uppercase tracking-wider rounded-md transition-colors",
                  location === link.href
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-border">
              {isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user?.firstName || "Member"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {isAdmin && (
                        <p className="text-xs text-primary font-semibold flex items-center gap-1">
                          <LayoutDashboard size={10} /> Admin
                        </p>
                      )}
                      {isCoach && !isAdmin && (
                        <p className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                          <ShieldCheck size={10} /> Coach
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-center" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button className="w-full justify-center" onClick={() => { openAuthModal(); setIsMobileMenuOpen(false); }}>
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
