import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MembershipSuccess() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-400" size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold uppercase mb-3">
          Welcome to <span className="text-primary">Border City!</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-2">Your payment was received.</p>
        <p className="text-sm text-muted-foreground mb-8">
          Our team will review your application and activate your membership shortly. You'll receive a confirmation at your email.
        </p>
        <Link href="/">
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
