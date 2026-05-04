import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Activity, HeartPulse } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-32">
      
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/BorderCityBoxing.jpg`}
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
            <p className="text-primary font-bold uppercase tracking-widest mb-4 text-lg">
              Home of the Champions
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter leading-none mb-6">
              HOME OF THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500 text-glow">
                CHAMPIONS
              </span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-medium">
              Join Border City Boxing Club. Whether you're fighting for a title, fitness, or fighting back against Parkinson's, we have a corner for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/classes">
                <Button size="lg" className="w-full sm:w-auto transform hover:-translate-y-1">
                  View Schedule & Book
                </Button>
              </Link>
            </div>
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
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Our Programs</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Classes designed for every skill level, age, and goal. Step into the ring and find your fight.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-card/50 border border-border rounded-xl p-8 hover:border-primary/50 transition-colors duration-300 group">
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Kids Class</h3>
              <p className="text-muted-foreground mb-6">
                Building discipline, confidence, and basic techniques in a safe, controlled environment for the next generation.
              </p>
              <Link href="/classes" className="text-primary font-bold uppercase tracking-wider text-sm hover:underline flex items-center gap-2">
                Learn More <span className="text-lg">→</span>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-card/50 border border-border rounded-xl p-8 hover:border-primary/50 transition-colors duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Recreation</h3>
              <p className="text-muted-foreground mb-6">
                High-intensity workouts combining boxing technique with cardiovascular conditioning for all fitness levels.
              </p>
              <Link href="/classes" className="text-primary font-bold uppercase tracking-wider text-sm hover:underline flex items-center gap-2">
                Learn More <span className="text-lg">→</span>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-card/50 border border-border rounded-xl p-8 hover:border-primary/50 transition-colors duration-300 group">
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <HeartPulse className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Rock Steady</h3>
              <p className="text-muted-foreground mb-6">
                A specialized program empowering people with Parkinson's disease to fight back through non-contact boxing.
              </p>
              <Link href="/classes" className="text-primary font-bold uppercase tracking-wider text-sm hover:underline flex items-center gap-2">
                Learn More <span className="text-lg">→</span>
              </Link>
            </div>

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
              className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "This is a great gym. The coaches and other members are so kind and encouraging. Even though I'm not the best and I have a hard time keeping up, I get a little better each time I go and I feel like that's recognized. Highly recommend giving it a try, they will work you hard though."
              </p>
              <p className="font-semibold text-sm">— Sauvé</p>
              <p className="text-xs text-muted-foreground">2 months ago</p>
            </motion.div>

            {/* Review 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "The place got great aesthetic and full of equipment the coaches are pros too."
              </p>
              <p className="font-semibold text-sm">— Beshr (Local Guide)</p>
              <p className="text-xs text-muted-foreground">3 months ago</p>
            </motion.div>

            {/* Review 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "This club has a positive and caring atmosphere. The knowledge and extensive experience of the many exceptional coaches is evident at both the recreational and boxing training sessions."
              </p>
              <p className="font-semibold text-sm">— Juanita Rivait</p>
              <p className="text-xs text-muted-foreground">6 months ago</p>
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
    </div>
  );
}
