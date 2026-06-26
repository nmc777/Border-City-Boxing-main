export function LocationSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Visit Us</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Located in Windsor, Ontario. Stop by and see why we're the home of champions.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-border shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.6289147849806!2d-83.0459!3d42.3142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b1a1a1a1a1a1b%3A0x1a1a1a1a1a1a1a1a!2s1072%20Drouillard%20Rd%2C%20Windsor%2C%20ON%20N8Y%202P8!5e0!3m2!1sen!2sca!4v1234567890"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-xl p-6 border border-border/30 hover:border-primary/30 transition-colors">
            <h3 className="text-xl font-bold mb-2">📍 Address</h3>
            <p className="text-muted-foreground">
              1072 Drouillard Rd<br />
              Windsor, ON N8Y 2P8
            </p>
          </div>
          <div className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-xl p-6 border border-border/30 hover:border-primary/30 transition-colors">
            <h3 className="text-xl font-bold mb-2">📞 Phone</h3>
            <a href="tel:+12267573988" className="text-muted-foreground hover:text-primary transition-colors">
              (226) 757-3988
            </a>
          </div>
          <div className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-xl p-6 border border-border/30 hover:border-primary/30 transition-colors">
            <h3 className="text-xl font-bold mb-2">🥊 Classes</h3>
            <a href="/classes" className="text-muted-foreground hover:text-primary transition-colors">
              View Schedule
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
