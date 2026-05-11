import { MapPin, Phone, Facebook, Instagram } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="bg-black border-t border-border py-12 mt-20 relative overflow-hidden">
      {/* Decorative pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img src={`${import.meta.env.BASE_URL}images/logo.svg`} alt="Border City Boxing Club" className="h-28 w-auto" />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Train hard, fight easy. The premier boxing club for kids, recreation, and Rock Steady fighters.
            </p>

            <div className="flex gap-2 mt-5">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon, bgClass, style }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className={`w-10 h-10 rounded flex items-center justify-center transition-all ${bgClass}`}
                  style={style}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/classes" className="hover:text-primary transition-colors">View Classes</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="/membership" className="hover:text-primary transition-colors">Membership</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg tracking-wider mb-4">Visit Us</h4>
            <address className="not-italic text-sm text-muted-foreground space-y-2">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                <span>
                  1072 Drouillard Rd<br />
                  Windsor, ON N8Y 2P8
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Phone size={14} className="text-primary mt-0.5 shrink-0" />
                <a href="tel:+12267573988" className="hover:text-primary transition-colors">
                  (226) 757-3988
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground space-y-4">
          <div className="text-sm font-semibold tracking-wider text-primary mb-4">
            🏆 SINCE 1996 🏆
          </div>
          <div className="flex justify-center gap-4">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <span aria-hidden="true">·</span>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
          <p>&copy; {new Date().getFullYear()} Border City Boxing Club. All rights reserved.</p>

          <div className="flex justify-center pt-4">
            <div className="group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Card */}
              <div className="relative px-8 py-4 rounded-xl bg-gradient-to-br from-background via-background to-primary/5 border border-primary/40 backdrop-blur-md shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-primary/70 font-light">Design &amp; Development</p>
                    <p className="text-sm font-bold text-foreground tracking-wide">Forgelo Studios</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
