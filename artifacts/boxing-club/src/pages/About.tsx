import { Trophy, Heart, Users, Target } from "lucide-react";

const VALUES = [
  { icon: Trophy, title: "Excellence", body: "We push every athlete — from first-timer to competitor — to be a stronger version of themselves." },
  { icon: Heart, title: "Community", body: "Border City Boxing is a family. Walk in a stranger, leave a teammate." },
  { icon: Users, title: "Inclusivity", body: "Youth Rec, Rec, and Rock Steady — there is a class and a coach for everyone, no matter your level." },
  { icon: Target, title: "Discipline", body: "Boxing is the sweet science. We teach footwork, focus, and respect in equal measure." },
];

export default function About() {
  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase">
          About <span className="text-primary">Border City</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          A boxing club built on grit, sweat, and the belief that anyone can step into the ring.
        </p>
      </div>

      <section className="grid md:grid-cols-2 gap-10 mb-16 items-start">
        <div>
          <h2 className="text-2xl font-display font-bold uppercase mb-4 text-primary">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Border City Boxing Club opened its doors with one mission: bring real, no-nonsense boxing
            instruction to our community. From the kid throwing their first jab to the parent
            stepping back into shape, our members find more than a workout here — they find a
            second home.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We run dedicated programs for youth athletes, recreational boxers, and our Rock Steady
            participants. Every coach on the floor has stepped between the ropes themselves, and
            every member walks out a little tougher than they walked in.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold uppercase mb-4 text-primary">What We Offer</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li><span className="text-foreground font-bold">Youth Rec</span> — Building confidence, coordination, and character for ages 4–16.</li>
            <li><span className="text-foreground font-bold">Rec</span> — Boxing, kickboxing, and BJJ for adults at every level.</li>
            <li><span className="text-foreground font-bold">Rock Steady Boxing</span> — A non-contact program designed for fighters with Parkinson's.</li>
            <li><span className="text-foreground font-bold">Open Mat & Sparring</span> — Time on the canvas with coaches and teammates.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold uppercase mb-6 text-primary">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card border border-border/50 rounded-lg p-6">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="text-primary" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
