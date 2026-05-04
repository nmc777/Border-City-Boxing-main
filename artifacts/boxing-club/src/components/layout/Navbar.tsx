import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCoachStatus, useAdminStatus } from "@/hooks/use-boxing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, ShieldCheck, LayoutDashboard, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

// Social links — single source of truth so the navbar and footer match.
// Each link carries its own brand bg (Facebook flat blue, Instagram official
// gradient) so the icon matches the platform people recognize.
const INSTAGRAM_GRADIENT =
  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";

const SOCIAL_LINKS: Array<{
  href: string;
  label: string;
  icon: typeof Facebook;
  bgClass: string;
  style?: React.CSSProperties;
}> = [
  {
    href: "https://www.facebook.com/BorderCityBoxingClub/",
    label: "Facebook",
    icon: Facebook,
    bgClass: "bg-[#1877F2] hover:bg-[#0d65d9] text-white",
  },
  {
    href: "https://www.instagram.com/thebordercityboxingclub/",
    label: "Instagram",
    icon: Instagram,
    bgClass: "text-white hover:opacity-90",
    style: { background: INSTAGRAM_GRADIENT },
  },
];
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
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  if (isAuthenticated) {
    navLinks.push({ href: "/dashboard", label: "Dashboard" });
  }

  if (isCoach) {
    navLinks.push({ href: "/coach", label: "Coach Portal", icon: <ShieldCheck size={13} /> });
  }

  if (isAdmin) {
    navLinks.push({ href: "/admin", label: "Admin", icon: <LayoutDashboard size={13} /> });
  }

  return (
    <>
      {/* Contact Header */}
      <div className="fixed top-0 w-full z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-4">
              <a href="https://maps.google.com/?q=1072+Drouillard+Rd,+Windsor,+ON+N8Y+2P8" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MapPin size={16} />
                <span>1072 Drouillard Rd, Windsor, ON N8Y 2P8</span>
              </a>
              <span className="hidden sm:inline text-border">•</span>
              <a href="tel:+12267573988" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone size={16} />
                <span>(226) 757-3988</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar - moved down to account for header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-12 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-36">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.img
              src={`${window.location.origin}/images/logo.svg`}
              alt="Border City Boxing Club"
              className="h-28 w-auto cursor-pointer"
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-bold uppercase tracking-wider transition-colors duration-200 hover:text-primary relative py-2 flex items-center gap-1",
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      className="flex items-center gap-1"
                    >
                      {link.icon}
                      {link.label}
                    </motion.div>
                    {location === link.href && (
                      <motion.span
                        layoutId="underline"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Social icons — small cluster between nav and auth. Hidden on
                tighter desktop widths (md..lg) to keep the bar from wrapping;
                appears at lg+ where there's room. Mobile menu has its own copy. */}
            <div className="hidden lg:flex items-center gap-2 border-l border-border pl-6">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon, bgClass, style }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${bgClass}`}
                  style={style}
                >
                  <Icon size={16} />
                </a>
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="md:hidden bg-background border-b border-border absolute top-36 w-full shadow-2xl z-40"
        >
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

            {/* Social row — same links as desktop but laid out for mobile. */}
            <div className="pt-4 mt-2 border-t border-border flex items-center justify-center gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon, bgClass, style }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-11 h-11 rounded-md flex items-center justify-center transition-all ${bgClass}`}
                  style={style}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      </motion.nav>
    </>
  );
}
