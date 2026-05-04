import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useMyBookings, useCancelClassBooking } from "@/hooks/use-boxing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function MyBookings() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading: isBookingsLoading } = useMyBookings();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelClassBooking();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isAuthLoading, setLocation]);

  if (isAuthLoading || (isBookingsLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen pt-32 px-4 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const activeBookings = bookings?.filter(b => b.status === "active") || [];
  const pastBookings = bookings?.filter(b => b.status === "cancelled") || []; // Assuming cancelled/completed go here for now

  const handleCancel = (bookingId: number, className: string) => {
    if (confirm(`Are you sure you want to cancel your spot in ${className}?`)) {
      cancelBooking({ bookingId }, {
        onSuccess: () => {
          toast({
            title: "Booking Cancelled",
            description: "Your spot has been released.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Could not cancel booking. Please try again.",
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">Fighter <span className="text-primary">Dashboard</span></h1>
        <p className="text-muted-foreground mt-2">Manage your training schedule and history.</p>
      </div>

      <div className="space-y-12">
        {/* Active Bookings */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <h2 className="text-2xl font-display font-bold uppercase tracking-wide">Upcoming Fights</h2>
          </div>

          {activeBookings.length === 0 ? (
            <div className="bg-card/30 border border-border border-dashed rounded-xl p-12 text-center">
              <p className="text-lg font-medium text-foreground">No upcoming classes.</p>
              <p className="text-muted-foreground mt-1 mb-6">Time to put the gloves on.</p>
              <Button onClick={() => setLocation("/classes")}>View Schedule</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-primary overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Badge className="mb-2 bg-primary/20 text-primary border-transparent">ACTIVE</Badge>
                          <h3 className="text-2xl font-display font-bold uppercase">{booking.class.name}</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-md">
                            <Calendar size={16} className="text-primary" />
                            <span className="font-medium text-foreground">{booking.class.schedule}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-md">
                            <Clock size={16} className="text-primary" />
                            <span>{booking.class.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-md">
                            <MapPin size={16} className="text-primary" />
                            <span>{booking.class.location}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          Booked on {format(new Date(booking.bookedAt), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      
                      <div className="md:w-auto w-full">
                        <Button 
                          variant="outline" 
                          className="w-full md:w-auto border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          onClick={() => handleCancel(booking.id, booking.class.name)}
                          disabled={isCancelling}
                        >
                          <XCircle size={16} className="mr-2" />
                          Cancel Spot
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Past/Cancelled Bookings */}
        {pastBookings.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-muted-foreground">History</h2>
            </div>
            
            <div className="grid gap-3">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="bg-card/40 border-border/50 opacity-75">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-display font-bold text-muted-foreground uppercase line-through">{booking.class.name}</h3>
                        <Badge variant="outline" className="text-xs text-muted-foreground">CANCELLED</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.class.schedule} &bull; {booking.class.instructor}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
