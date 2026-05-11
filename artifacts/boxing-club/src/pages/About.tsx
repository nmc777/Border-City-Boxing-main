import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col pt-32 md:pt-48">
      {/* Header Section */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500">Border City Boxing</span>
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-lg text-muted-foreground">
              30 years of excellence in boxing and community
            </p>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 bg-card/30 border-t border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-card/50 to-card/30 border border-border/30 rounded-xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
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
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-24 bg-background">
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
              className="bg-gradient-to-br from-card/50 to-card/30 border border-border/30 rounded-xl p-6 hover:border-primary/30 transition-colors"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide world-class boxing training and develop athletes who excel in competition and in life.
                We create a supportive environment where everyone can discover their strength.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-card/50 to-card/30 border border-border/30 rounded-xl p-6 hover:border-primary/30 transition-colors"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Excellence</h3>
              <p className="text-muted-foreground">
                We're committed to the highest standards in coaching, facility maintenance, and member experience. Excellence is not a destination — it's our daily commitment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-card/50 to-card/30 border border-border/30 rounded-xl p-6 hover:border-primary/30 transition-colors"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Community</h3>
              <p className="text-muted-foreground">
                We believe in the power of community. Every member is valued, and we create an environment where everyone belongs and can achieve their goals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-card/30 border-t border-border/50">
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
                icon: "💪",
                title: "State-of-the-Art Facility",
                description: "Modern equipment and a welcoming environment designed for your success."
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
                className="flex gap-6 items-start bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-lg border border-border/30"
              >
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
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
