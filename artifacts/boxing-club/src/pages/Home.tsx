import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Activity, HeartPulse } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-40">
      
      {/* Hero Section */}
      <section className="relative h-[120vh] min-h-[850px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/BorderCityBoxing.jpg"
            alt="Border City Boxing Club Team"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/50" />
          <div className="absolute inset-0 bg-black/15" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter leading-none mb-6">
              HOME OF THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500 text-glow">
                CHAMPIONS
              </span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-medium">
              Join Border City Boxing Club. Whether you're fighting for a title, fitness, or fighting back against Parkinson's, we have a corner for you.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link href="/classes">
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-orange-500 hover:shadow-2xl hover:shadow-primary/50 transition-shadow"
                  >
                    View Schedule & Book
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Decorative Grid Line */}
        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </section>

      {/* Programs Section */}
      <section className="py-24 bg-background relative">
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-2">Our Programs</h2>
            <div className="h-1 w-32 mx-auto rounded-full mb-4 bg-gradient-to-r from-red-600 via-primary to-orange-500" />
            <p className="text-lg md:text-xl font-semibold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-primary to-orange-500">
                Growth
              </span>
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Classes designed for every skill level, age, and goal. Step into the ring and find your fight.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-card/50 to-card/30 border border-red-500 md:border-border/50 rounded-xl p-8 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative"
              whileHover={{ scale: 1.02, translateY: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg flex items-center justify-center mb-6 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold mb-3">Kids Class</h3>
              <p className="text-muted-foreground mb-6">
                Building discipline, confidence, and basic techniques in a safe, controlled environment for the next generation.
              </p>
              <motion.div whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="/classes" className="text-primary font-bold uppercase tracking-wider text-sm flex items-center gap-2 group/link">
                  <span className="group-hover/link:underline">Learn More</span>
                  <motion.span
                    className="text-lg"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-card/50 to-card/30 border border-red-500 md:border-border/50 rounded-xl p-8 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative"
              whileHover={{ scale: 1.02, translateY: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg flex items-center justify-center mb-6 relative"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Activity className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold mb-3">Recreation</h3>
              <p className="text-muted-foreground mb-6">
                High-intensity workouts combining boxing technique with cardiovascular conditioning for all fitness levels.
              </p>
              <motion.div whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="/classes" className="text-primary font-bold uppercase tracking-wider text-sm flex items-center gap-2 group/link">
                  <span className="group-hover/link:underline">Learn More</span>
                  <motion.span
                    className="text-lg"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-card/50 to-card/30 border border-red-500 md:border-border/50 rounded-xl p-8 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative"
              whileHover={{ scale: 1.02, translateY: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg flex items-center justify-center mb-6 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <HeartPulse className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold mb-3">Rock Steady</h3>
              <p className="text-muted-foreground mb-6">
                A specialized program empowering people with Parkinson's disease to fight back through non-contact boxing.
              </p>
              <motion.div whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="/classes" className="text-primary font-bold uppercase tracking-wider text-sm flex items-center gap-2 group/link">
                  <span className="group-hover/link:underline">Learn More</span>
                  <motion.span
                    className="text-lg"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-card/30 border-t border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">What Our Members Say</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of satisfied members who've transformed their lives at Border City Boxing Club.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl overflow-hidden border border-border/30 group relative"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <img
                src="/images/BorderCityBoxingWindsorOntarioReview1.png"
                alt="Member review 1"
                className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </motion.div>

            {/* Review 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl overflow-hidden border border-border/30 group relative"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <img
                src="/images/BorderCityBoxingWindsorOntarioReview2.png"
                alt="Member review 2"
                className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </motion.div>

            {/* Review 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl overflow-hidden border border-border/30 group relative"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <img
                src="/images/BorderCityBoxingWindsorOntarioReview3.png"
                alt="Member review 3"
                className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">⭐ 4.7 out of 5 stars • 59 Google reviews</p>
            <a
              href="https://www.google.com/maps/place/Border+City+Boxing+Club/@42.3142,-83.0459,15z"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-primary font-bold uppercase tracking-wider hover:underline"
            >
              Read all reviews on Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Location Section */}
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
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-xl p-6 border border-border/30 group hover:border-primary/30 transition-colors"
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <h3 className="text-xl font-bold mb-2 relative">📍 Address</h3>
              <p className="text-muted-foreground relative">
                1072 Drouillard Rd<br />
                Windsor, ON N8Y 2P8
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-xl p-6 border border-border/30 group hover:border-primary/30 transition-colors"
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <h3 className="text-xl font-bold mb-2 relative">📞 Phone</h3>
              <a
                href="tel:+12267573988"
                className="text-muted-foreground hover:text-primary transition-colors relative"
              >
                (226) 757-3988
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-xl p-6 border border-border/30 group hover:border-primary/30 transition-colors"
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <h3 className="text-xl font-bold mb-2 relative">🥊 Classes</h3>
              <a
                href="/classes"
                className="text-muted-foreground hover:text-primary transition-colors relative"
              >
                View Schedule
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
