import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, User, HeartPulse, Shield } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "single",
    label: "Single",
    price: "$125",
    period: "/month",
    icon: <User size={28} className="text-primary" />,
    description: "Full access for one individual.",
    features: [
      "All recreation classes",
      "Online booking",
      "Member-only events",
      "Locker room access",
    ],
  },
  {
    id: "family",
    label: "Family",
    price: "$125",
    period: "/month",
    badge: "+ $60 per additional member",
    icon: <Users size={28} className="text-primary" />,
    description: "Covers 2 members. Add up to 2 more at $60 each.",
    features: [
      "Everything in Single",
      "Up to 4 family members",
      "3rd member +$60/mo",
      "4th member +$60/mo",
    ],
    highlighted: true,
  },
  {
    id: "rock_steady",
    label: "Rock Steady",
    price: "$75",
    period: "/month",
    icon: <HeartPulse size={28} className="text-primary" />,
    description: "Specialized boxing program for Parkinson's patients.",
    features: [
      "Rock Steady Boxing classes",
      "Certified coaches",
      "Community support",
      "Online booking",
    ],
  },
  {
    id: "womens_only",
    label: "Women's Only",
    price: "$75",
    period: "/month",
    icon: <Shield size={28} className="text-primary" />,
    description: "A safe, empowering space exclusively for women.",
    features: [
      "Women's only classes",
      "All skill levels welcome",
      "Online booking",
      "Member-only events",
    ],
  },
];

export default function Membership() {
  const [, navigate] = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleSelect = (planId: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    navigate(`/membership/signup?plan=${planId}`);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase mb-4">
          Choose Your <span className="text-primary">Plan</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join Border City Boxing Club. Whether you're fighting for a title, fitness, or fighting back against Parkinson's — we have a corner for you.
        </p>
        {!isAuthenticated && (
          <p className="mt-4 text-sm text-primary font-semibold">
            You must be logged in to purchase a membership.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`h-full flex flex-col relative ${plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="mb-3">{plan.icon}</div>
                <CardTitle className="text-2xl font-display uppercase">{plan.label}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-4xl font-display font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                {plan.badge && (
                  <p className="text-xs text-primary font-semibold mt-1">{plan.badge}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between gap-6">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => handleSelect(plan.id)}
                >
                  {isAuthenticated ? "Select Plan" : "Login to Join"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
