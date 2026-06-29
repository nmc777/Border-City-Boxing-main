import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function About() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: `${import.meta.env.BASE_URL}images/BorderCityBoxingRecreationalFitnessClassWindsorOntario.png`,
      title: "Recreational Fitness",
    },
    {
      image: `${import.meta.env.BASE_URL}images/BordercityBoxingClubKidsClass2.png`,
      title: "Kids Class",
    },
    {
      image: `${import.meta.env.BASE_URL}images/RockSteadyParkinsonsFitnessClass.png`,
      title: "Rock Steady",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-40">
      {/* Header Section */}
      <section
        id="about-top"
        className="py-24 relative overflow-hidden"
        style={{
          backgroundImage: `url(/images/BorderCityBoxingClubKidsClass.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay with glassmorphic gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/60" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-glow">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500">Border City Boxing</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-24 h-1.5 bg-gradient-to-r from-red-600 via-primary to-orange-500 mx-auto rounded-full mb-6 origin-center"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-white/90 font-semibold"
            >
              30 years of excellence in boxing and community
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 bg-card/30 border-t border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-card/50 via-card/40 to-card/20 border border-border/30 rounded-xl p-8 md:p-12 group relative overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.03, y: -6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 relative z-10">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed relative z-10">
                <p>
                  Border City Boxing Club was established in 1996 on Drouillard Road in Windsor, Ontario.
                  For over three decades, we've been a cornerstone of the boxing community, dedicated to
                  developing champions both inside and outside the ring.
                </p>
                <p>
                  What started as a vision to provide quality boxing training has grown into a vibrant community
                  hub. We've trained countless athletes, from competitive boxers to fitness enthusiasts, and we've
                  made a meaningful impact on the lives of our members.
                </p>
                <p>
                  Today, Border City Boxing Club remains committed to our core values: excellence, dedication,
                  and community. We continue to evolve and expand our programs to serve everyone — whether you're
                  pursuing professional boxing, improving your fitness, or fighting back against Parkinson's disease.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-xl overflow-hidden border border-primary/30 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
              whileHover={{ scale: 1.03 }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}images/BorderCityBoxingCoachAndreGorgesJoshCameron.png`}
                  alt="Border City Boxing Coaches Andre Gorges and Josh Cameron"
                  className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Photo Slideshow Section */}
      <section className="py-24 bg-background relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold text-center mb-16"
          >
            Our Facility & Classes
          </motion.h2>

          <Link href="/classes">
            <div className="relative rounded-xl overflow-hidden border border-primary/40 shadow-lg shadow-primary/30 cursor-pointer group hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Slideshow Container */}
              <div className="relative w-full h-[300px] md:h-[500px] bg-black">
                {slides.map((slide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentSlide === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="w-full p-6 md:p-8">
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{slide.title}</h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

                {/* Navigation Buttons */}
                <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                  <motion.button
                    onClick={prevSlide}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-primary/80 hover:bg-primary text-white transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    onClick={nextSlide}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-primary/80 hover:bg-primary text-white transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </div>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {slides.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`rounded-full transition-all ${
                        currentSlide === index
                          ? "bg-primary w-8 h-3 shadow-lg shadow-primary/60"
                          : "bg-white/40 w-3 h-3 hover:bg-white/70"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>
            </Link>
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
              className="rounded-xl overflow-hidden border border-primary/40 group relative scale-105"
              whileHover={{ scale: 1.08, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 opacity-100 transition-opacity duration-300 z-10" />
              <img
                src="/images/BorderCityBoxingWindsorOntarioReview2.png"
                alt="Member review 2"
                className="w-full h-auto object-cover brightness-110 transition-all duration-300"
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

      {/* Mission & Values Section */}
      <section className="py-24 bg-gradient-to-br from-white/5 via-background to-white/10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold text-center mb-16"
          >
            Our Mission & Values
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 group relative overflow-hidden shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              whileHover={{ scale: 1.04, y: -6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-2xl font-bold mb-4 text-white relative z-10">Our Mission</h3>
              <p className="text-gray-200 relative z-10">
                To provide world-class boxing training and develop athletes who excel in competition and in life.
                We create a supportive environment where everyone can discover their strength.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 group relative overflow-hidden shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              whileHover={{ scale: 1.04, y: -6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-2xl font-bold mb-4 text-white relative z-10">Excellence</h3>
              <p className="text-gray-200 relative z-10">
                We're committed to the highest standards in coaching, facility maintenance, and member experience. Excellence is not a destination — it's our daily commitment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 group relative overflow-hidden shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              whileHover={{ scale: 1.04, y: -6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-2xl font-bold mb-4 text-white relative z-10">Community</h3>
              <p className="text-gray-200 relative z-10">
                We believe in the power of community. Every member is valued, and we create an environment where everyone belongs and can achieve their goals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gradient-to-br from-white/5 via-card/20 to-white/5 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold text-center mb-16"
          >
            Why Choose Border City Boxing?
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                icon: "🥊",
                title: "Expert Coaches",
                description: "Our coaches bring decades of experience and a passion for developing champions."
              },
              {
                icon: "🏋️",
                title: "Inclusive Programs",
                description: "From kids to adults, competitive to recreational, we have programs for everyone."
              },
              {
                icon: "🤝",
                title: "Supportive Community",
                description: "Train alongside members who share your passion and push you to be better."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 items-start bg-gradient-to-r from-primary/8 via-transparent to-primary/5 p-6 rounded-xl border border-border/30 group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/15"
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <motion.div
                  className="text-5xl flex-shrink-0 transition-transform duration-300"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  {item.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
