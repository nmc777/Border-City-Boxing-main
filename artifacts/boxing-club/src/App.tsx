import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocationSection } from "@/components/layout/LocationSection";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

import Home from "@/pages/Home";
import Classes from "@/pages/Classes";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import ResetPassword from "@/pages/ResetPassword";
import Membership from "@/pages/Membership";
import CoachPortal from "@/pages/CoachPortal";
import AdminPortal from "@/pages/AdminPortal";
import WalkIn from "@/pages/WalkIn";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/walkin" component={WalkIn} />
      <Route>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/classes" component={Classes} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/reset-password" component={ResetPassword} />
              <Route path="/membership" component={Membership} />
              <Route path="/coach" component={CoachPortal} />
              <Route path="/admin" component={AdminPortal} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <LocationSection />
          <Footer />
          <AuthModal />
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
