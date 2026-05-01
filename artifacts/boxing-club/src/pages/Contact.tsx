import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing info", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    // Placeholder — wire to real endpoint or email service later.
    await new Promise(r => setTimeout(r, 600));
    setSubmitting(false);
    setForm({ name: "", email: "", message: "" });
    toast({ title: "Message sent", description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase">
          Get In <span className="text-primary">Touch</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Questions about classes, memberships, or coming in for a trial? Drop us a line.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h2 className="text-2xl font-display font-bold uppercase mb-4 text-primary">Visit Us</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-bold">Border City Boxing Club</p>
                  <p className="text-muted-foreground text-sm">1072 Drouillard Rd<br />Windsor, ON N8Y 2P8</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-primary mt-0.5 shrink-0" size={18} />
                <a href="tel:+12267573988" className="text-muted-foreground hover:text-primary transition">
                  (226) 757-3988
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-primary mt-0.5 shrink-0" size={18} />
                <a href="mailto:info@bordercityboxing.ca" className="text-muted-foreground hover:text-primary transition">
                  info@bordercityboxing.ca
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h2 className="text-2xl font-display font-bold uppercase mb-4 text-primary flex items-center gap-2">
              <Clock size={20} /> Hours
            </h2>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li className="flex justify-between"><span>Mon – Fri</span><span>10:00 AM – 9:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span><span>9:00 AM – 2:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span><span>10:00 AM – 1:00 PM</span></li>
            </ul>
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h2 className="text-2xl font-display font-bold uppercase mb-4 text-primary">Follow</h2>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/thebordercityboxingclub/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="w-10 h-10 rounded text-white hover:opacity-90 flex items-center justify-center transition-all"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                }}
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/BorderCityBoxingClub/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook"
                className="w-10 h-10 rounded bg-[#1877F2] hover:bg-[#0d65d9] text-white flex items-center justify-center transition-all"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-lg p-6 space-y-4 h-fit">
          <h2 className="text-2xl font-display font-bold uppercase text-primary">Send a Message</h2>
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded bg-background border border-border focus:border-primary outline-none text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded bg-background border border-border focus:border-primary outline-none text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Message</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded bg-background border border-border focus:border-primary outline-none text-sm resize-none"
              placeholder="What can we help with?"
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
