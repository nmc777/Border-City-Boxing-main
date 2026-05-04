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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm transform -skew-x-12">
                <span className="font-display font-bold text-background text-sm">BC</span>
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-foreground">
                BORDER CITY BOXING
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Train hard, fight easy. The premier boxing club for kids, recreation, and Rock Steady fighters.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-lg tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/classes" className="hover:text-primary transition-colors">View Classes</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-lg tracking-wider mb-4">Location</h4>
            <address className="not-italic text-sm text-muted-foreground space-y-1">
              <p>123 Fight Avenue</p>
              <p>Border City, BC 12345</p>
              <p className="pt-2">contact@bordercityboxing.com</p>
            </address>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Border City Boxing Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
