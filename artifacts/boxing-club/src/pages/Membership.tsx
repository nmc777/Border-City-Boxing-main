import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, User, Users, Sparkles, Loader2, Plus, Trash2, Lock, ChevronRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Square?: any;
  }
}

type Plan = "single" | "family";
type Term = 1 | 3 | 6;

const PRICES: Record<Term, Record<Plan, number>> = {
  1: { single: 1,   family: 125 },  // single 1-month set to $1 for production testing — change back to 75 after test
  3: { single: 200, family: 340 },
  6: { single: 375, family: 625 },
};

const TERM_LABELS: Record<Term, string> = {
  1: "1 Month",
  3: "3 Months",
  6: "6 Months",
};

const PERKS: Record<Term, string[]> = {
  1: ["All classes (Youth Rec, Rec, Rock Steady)", "Cancel anytime", "Walk-in friendly"],
  3: ["All classes included", "Save vs monthly", "Best for committed regulars"],
  6: ["All classes included", "Best value — biggest savings", "Uninterrupted access"],
};

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APPLICATION_ID as string;
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID as string;

function fmt(n: number) {
  return `$${n}`;
}

function pricePerMonth(price: number, term: Term) {
  return Math.round((price / term) * 100) / 100;
}

type Step = "intake" | "payment";
type ModalOpen = "terms" | "waiver" | null;

const COUNTRIES = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
];

const CA_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];


// Bounds for date-of-birth inputs. min = 1900-01-01 (cap on absurdly old years);
// max = today (no future-born members). Without these, browsers happily accept
// 6-digit years like "200000".
const DOB_MIN = "1900-01-01";
const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Belt-and-braces check on top of input min/max in case a paste or keyboard
// edge case sneaks an out-of-range year through.
function isPlausibleDob(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const year = d.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  return year >= 1900 && year <= currentYear && d.getTime() <= Date.now();
}

const EMPTY_INTAKE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "CA",
  acceptedTerms: false,
  acceptedWaiver: false,
};

type FamilyMemberInput = { firstName: string; lastName: string; dob: string };
const EMPTY_FAMILY_MEMBER: FamilyMemberInput = { firstName: "", lastName: "", dob: "" };
const INITIAL_FAMILY_MEMBERS: FamilyMemberInput[] = [
  { ...EMPTY_FAMILY_MEMBER },
  { ...EMPTY_FAMILY_MEMBER },
];

export default function Membership() {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [selected, setSelected] = useState<{ term: Term; plan: Plan } | null>(null);
  const [step, setStep] = useState<Step>("intake");
  const [intake, setIntake] = useState(EMPTY_INTAKE);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberInput[]>(INITIAL_FAMILY_MEMBERS);
  const [submitting, setSubmitting] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [modalOpen, setModalOpen] = useState<ModalOpen>(null);
  const cardRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);

  const openIntake = (term: Term, plan: Plan) => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Create an account or log in to purchase a membership." });
      openAuthModal();
      return;
    }
    setSelected({ term, plan });
    setStep("intake");
    setIntake({
      ...EMPTY_INTAKE,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: (user as any)?.email ?? "",
    });
    setFamilyMembers(plan === "family" ? INITIAL_FAMILY_MEMBERS.map((fm) => ({ ...fm })) : []);
  };

  const updateFamilyMember = (idx: number, key: keyof FamilyMemberInput, value: string) => {
    setFamilyMembers((prev) => prev.map((fm, i) => (i === idx ? { ...fm, [key]: value } : fm)));
  };
  const addFamilyMember = () => {
    setFamilyMembers((prev) => (prev.length >= 4 ? prev : [...prev, { ...EMPTY_FAMILY_MEMBER }]));
  };
  const removeFamilyMember = (idx: number) => {
    setFamilyMembers((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const closeDialog = () => {
    setSelected(null);
    setStep("intake");
    cardRef.current = null;
    setCardReady(false);
  };

  useEffect(() => {
    if (step !== "payment" || !selected) return;
    if (!window.Square) {
      toast({ title: "Payment unavailable", description: "Square failed to load. Please refresh.", variant: "destructive" });
      return;
    }

    let cancelled = false;
    let mountedCard: any = null;
    async function mountCard() {
      try {
        await new Promise((r) => setTimeout(r, 50));
        const container = document.getElementById("square-card-container");
        if (!container) throw new Error("Card container not found in DOM");

        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        paymentsRef.current = payments;
        // Let Square's card form pick the postal-code format from the location
        // country (CA → A1A 1A1, US → 12345). Don't pre-fill — that can confuse
        // the iframe's country detection and force US ZIP validation.
        const card = await payments.card();
        if (cancelled) return;
        await card.attach("#square-card-container");
        mountedCard = card;
        cardRef.current = card;
        setCardReady(true);
      } catch (err: any) {
        console.error("Square card mount error:", err);
        if (!cancelled) {
          toast({
            title: "Card form error",
            description: err?.message ?? String(err),
            variant: "destructive",
          });
        }
      }
    }

    mountCard();
    return () => {
      cancelled = true;
      if (mountedCard?.destroy) mountedCard.destroy().catch(() => {});
    };
  }, [step, selected]);

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: Array<[keyof typeof intake, string]> = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["email", "Email"],
      ["phone", "Phone"],
      ["dob", "Date of birth"],
      ["addressLine1", "Street address"],
      ["city", "City"],
      ["province", "Province"],
      ["postalCode", "Postal code"],
    ];
    for (const [k, label] of required) {
      if (!String(intake[k] ?? "").trim()) {
        toast({ title: "Missing info", description: `${label} is required.`, variant: "destructive" });
        return;
      }
    }

    if (!isPlausibleDob(intake.dob)) {
      toast({
        title: "Invalid date of birth",
        description: "Please enter a real date — year between 1900 and today.",
        variant: "destructive",
      });
      return;
    }

    if (!intake.addressLine1 || !intake.city || !intake.postalCode) {
      toast({
        title: "Address required",
        description: "Please fill in your address, city, and postal code.",
        variant: "destructive",
      });
      return;
    }

    // Validate postal code by country
    const postal = intake.postalCode.trim();
    const isCA = intake.country === "CA";
    const postalRegex = isCA ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/ : /^\d{5}(-\d{4})?$/;
    if (!postalRegex.test(postal)) {
      toast({
        title: isCA ? "Invalid postal code" : "Invalid ZIP code",
        description: isCA ? "Use Canadian format: A1A 1A1" : "Use format: 12345 or 12345-6789",
        variant: "destructive",
      });
      return;
    }

    if (!intake.acceptedTerms || !intake.acceptedWaiver) {
      toast({ title: "Acceptance required", description: "You must accept the terms and waiver.", variant: "destructive" });
      return;
    }

    if (selected?.plan === "family") {
      if (familyMembers.length < 2 || familyMembers.length > 4) {
        toast({ title: "Family members required", description: "Add 2 to 4 family members on the plan.", variant: "destructive" });
        return;
      }
      for (let i = 0; i < familyMembers.length; i++) {
        const fm = familyMembers[i];
        if (!fm.firstName.trim() || !fm.lastName.trim() || !fm.dob.trim()) {
          toast({
            title: `Family member ${i + 1} incomplete`,
            description: "First name, last name, and date of birth are required for each family member.",
            variant: "destructive",
          });
          return;
        }
        if (!isPlausibleDob(fm.dob)) {
          toast({
            title: `Family member ${i + 1} — invalid date of birth`,
            description: "Year must be between 1900 and today.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    setStep("payment");
  };

  const handlePayment = async () => {
    if (!selected || !cardRef.current || !paymentsRef.current) return;
    setSubmitting(true);
    try {
      // Step 1: tokenize the card. Square's `tokenize()` only takes the source;
      // do NOT pass verificationDetails here — that's what `verifyBuyer` is for.
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK") {
        const msg = result.errors?.[0]?.message ?? "Card tokenization failed.";
        toast({ title: "Card error", description: msg, variant: "destructive" });
        return;
      }

      // Step 2: run buyer verification (SCA / 3DS). Square requires this for
      // Canadian transactions on the Web Payments SDK. The returned token must
      // be forwarded to the backend alongside the source token.
      const amount = PRICES[selected.term][selected.plan].toFixed(2);
      const billingContact = {
        givenName: intake.firstName,
        familyName: intake.lastName,
        email: intake.email,
        phone: intake.phone,
        countryCode: intake.country,
        city: intake.city,
        state: intake.province,
        postalCode: intake.postalCode,
        addressLines: [intake.addressLine1, intake.addressLine2].filter(Boolean) as string[],
      };
      let verificationToken: string | undefined;
      try {
        const verification = await paymentsRef.current.verifyBuyer(result.token, {
          amount,
          billingContact,
          currencyCode: "CAD",
          intent: "CHARGE",
        });
        verificationToken = verification?.token;
      } catch (verr: any) {
        const msg = verr?.message ?? "Card verification failed.";
        toast({ title: "Verification failed", description: msg, variant: "destructive" });
        return;
      }

      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: result.token,
          verificationToken,
          plan: selected.plan,
          termMonths: selected.term,
          buyerEmail: intake.email,
          billing: {
            firstName: intake.firstName,
            lastName: intake.lastName,
            addressLine1: intake.addressLine1,
            addressLine2: intake.addressLine2 || null,
            city: intake.city,
            province: intake.province,
            postalCode: intake.postalCode,
            country: intake.country,
            phone: intake.phone,
          },
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        toast({ title: "Payment failed", description: payData.error ?? "Try again.", variant: "destructive" });
        return;
      }

      const memRes = await fetch("/api/memberships", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: intake.firstName,
          lastName: intake.lastName,
          dob: intake.dob,
          phone: intake.phone,
          addressLine1: intake.addressLine1,
          addressLine2: intake.addressLine2 || null,
          city: intake.city,
          province: intake.province,
          postalCode: intake.postalCode,
          country: intake.country,
          plan: selected.plan,
          termMonths: selected.term,
          acceptedTerms: true,
          acceptedWaiver: true,
          paymentId: payData.paymentId,
          ...(selected.plan === "family"
            ? {
                familyMembers: familyMembers.map((fm) => ({
                  firstName: fm.firstName.trim(),
                  lastName: fm.lastName.trim(),
                  dob: fm.dob,
                })),
              }
            : {}),
        }),
      });
      const memData = await memRes.json();
      if (!memRes.ok) {
        toast({ title: "Activation failed", description: memData.error ?? "Try again.", variant: "destructive" });
        return;
      }

      toast({ title: "Membership activated!", description: "Payment successful. See you in class." });
      closeDialog();
      navigate("/dashboard");
    } catch {
      toast({ title: "Network error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: keyof typeof intake) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setIntake({ ...intake, [k]: e.target.value });

  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 uppercase">
          Pick Your <span className="text-primary">Plan</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          One price, every class — Youth Rec, Rec, and Rock Steady. Choose the term that fits, solo or with the whole family.
        </p>
      </div>

      {(["single", "family"] as Plan[]).map((plan) => (
        <section key={plan} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {plan === "single" ? (
              <User className="text-primary" size={24} />
            ) : (
              <Users className="text-primary" size={24} />
            )}
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase">
              {plan === "single" ? "Single Plan" : "Family Plan"}
            </h2>
            {plan === "family" && (
              <span className="text-xs uppercase tracking-wider bg-primary/15 text-primary px-2 py-1 rounded">
                Up to 4 members
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([1, 3, 6] as Term[]).map((term) => {
              const price = PRICES[term][plan];
              const isFeatured = term === 6;
              return (
                <div
                  key={term}
                  className={`relative bg-card border rounded-xl p-6 flex flex-col ${
                    isFeatured ? "border-primary shadow-[0_0_0_1px_rgb(var(--primary)/0.5)]" : "border-border/50"
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} /> Best Value
                    </div>
                  )}

                  <h3 className="text-xl font-display font-bold uppercase mb-1">{TERM_LABELS[term]}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                    {plan === "single" ? "1 person" : "Family of up to 4"}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold">{fmt(price)}</span>
                      <span className="text-muted-foreground text-sm">/ {term} mo</span>
                    </div>
                    {term > 1 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmt(pricePerMonth(price, term))} per month
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {PERKS[term].map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="text-primary mt-0.5 shrink-0" size={14} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => openIntake(term, plan)}
                    className="w-full"
                    variant={isFeatured ? "default" : "outline"}
                  >
                    Select Plan
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-center text-sm text-muted-foreground mt-8">
        Have questions about membership?{" "}
        <button onClick={() => navigate("/contact")} className="text-primary hover:underline">
          Contact us
        </button>
      </p>

      <Dialog open={!!selected} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="w-full max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0">

          {/* Shopify-style header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-border/40">
            <img
              src="/images/border-city-boxing-club-logo-windsor-ontario.png"
              alt="Border City Boxing Club"
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock size={12} /> Secure checkout
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-h-0">

            {/* ── Left: form ── */}
            <div className="flex-1 px-8 py-6 overflow-y-auto">

              {/* Breadcrumb steps */}
              <nav className="flex items-center gap-1.5 text-sm mb-8">
                <span className={step === "intake" ? "text-foreground font-semibold" : "text-muted-foreground"}>
                  Information
                </span>
                <ChevronRight size={14} className="text-muted-foreground" />
                <span className={step === "payment" ? "text-foreground font-semibold" : "text-muted-foreground"}>
                  Payment
                </span>
              </nav>

              {step === "intake" && (
                <form onSubmit={handleIntakeSubmit} className="space-y-5">

                  {/* Contact */}
                  <div>
                    <h2 className="text-base font-semibold mb-3">Contact information</h2>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="intake-first" className="text-xs text-muted-foreground">First Name *</Label>
                          <Input id="intake-first" className="mt-1" value={intake.firstName} onChange={set("firstName")} />
                        </div>
                        <div>
                          <Label htmlFor="intake-last" className="text-xs text-muted-foreground">Last Name *</Label>
                          <Input id="intake-last" className="mt-1" value={intake.lastName} onChange={set("lastName")} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="intake-email" className="text-xs text-muted-foreground">Email *</Label>
                          <Input id="intake-email" type="email" className="mt-1" value={intake.email} onChange={set("email")} />
                        </div>
                        <div>
                          <Label htmlFor="intake-phone" className="text-xs text-muted-foreground">Phone *</Label>
                          <Input id="intake-phone" type="tel" className="mt-1" value={intake.phone} onChange={set("phone")} placeholder="555-555-5555" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="intake-dob" className="text-xs text-muted-foreground">Date of Birth *</Label>
                        <Input id="intake-dob" type="date" className="mt-1" value={intake.dob} onChange={set("dob")} min={DOB_MIN} max={todayIso()} />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h2 className="text-base font-semibold mb-3">Billing address</h2>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="intake-country" className="text-xs text-muted-foreground">Country / Region *</Label>
                        <select
                          id="intake-country"
                          value={intake.country}
                          onChange={(e) => setIntake({ ...intake, country: e.target.value, addressLine1: "", city: "", province: "", postalCode: "" })}
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="intake-addr1" className="text-xs text-muted-foreground">Address *</Label>
                        <Input id="intake-addr1" type="text" className="mt-1" placeholder="123 Main St" value={intake.addressLine1} onChange={(e) => setIntake((prev) => ({ ...prev, addressLine1: e.target.value }))} />
                      </div>
                      <div>
                        <Label htmlFor="intake-addr2" className="text-xs text-muted-foreground">Apt / Suite (optional)</Label>
                        <Input id="intake-addr2" className="mt-1" value={intake.addressLine2} onChange={set("addressLine2")} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="intake-city" className="text-xs text-muted-foreground">City *</Label>
                          <Input id="intake-city" className="mt-1" value={intake.city} onChange={set("city")} />
                        </div>
                        <div>
                          <Label htmlFor="intake-province" className="text-xs text-muted-foreground">{intake.country === "US" ? "State" : "Province"} *</Label>
                          <select
                            id="intake-province"
                            value={intake.province}
                            onChange={(e) => setIntake({ ...intake, province: e.target.value })}
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">Select…</option>
                            {(intake.country === "US" ? US_STATES : CA_PROVINCES).map((p) => (
                              <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="intake-postal" className="text-xs text-muted-foreground">{intake.country === "US" ? "ZIP" : "Postal Code"} *</Label>
                          <Input id="intake-postal" className="mt-1" value={intake.postalCode} onChange={set("postalCode")} placeholder={intake.country === "US" ? "12345" : "A1A 1A1"} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-3 pt-1">
                    <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={intake.acceptedTerms} onChange={(e) => setIntake({ ...intake, acceptedTerms: e.target.checked })} className="mt-0.5 accent-primary" />
                      <span className="text-muted-foreground">I accept the <button type="button" onClick={() => setModalOpen("terms")} className="text-foreground font-medium underline underline-offset-2 hover:text-primary transition-colors">Terms and Conditions</button>.</span>
                    </label>
                    <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={intake.acceptedWaiver} onChange={(e) => setIntake({ ...intake, acceptedWaiver: e.target.checked })} className="mt-0.5 accent-primary" />
                      <span className="text-muted-foreground">I accept the <button type="button" onClick={() => setModalOpen("waiver")} className="text-foreground font-medium underline underline-offset-2 hover:text-primary transition-colors">Facility Waiver</button> and assume the risks of training, on behalf of myself and any family members listed.</span>
                    </label>
                  </div>

                  {/* Family members */}
                  {selected?.plan === "family" && (
                    <div className="pt-4 border-t border-border/50">
                      <h2 className="text-base font-semibold mb-1">Family members on plan</h2>
                      <p className="text-xs text-muted-foreground mb-4">Add 2–4 family members. They'll be checked in at the front desk by name.</p>
                      <div className="space-y-4">
                        {familyMembers.map((fm, i) => (
                          <div key={i} className="rounded-lg border border-border/50 bg-muted/20 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Member {i + 1}{i < 2 ? <span className="text-destructive ml-1">*</span> : null}
                              </p>
                              {i >= 2 && (
                                <button type="button" onClick={() => removeFamilyMember(i)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <Label htmlFor={`fm-${i}-first`} className="text-xs text-muted-foreground">First Name *</Label>
                                <Input id={`fm-${i}-first`} className="mt-1" value={fm.firstName} onChange={(e) => updateFamilyMember(i, "firstName", e.target.value)} />
                              </div>
                              <div>
                                <Label htmlFor={`fm-${i}-last`} className="text-xs text-muted-foreground">Last Name *</Label>
                                <Input id={`fm-${i}-last`} className="mt-1" value={fm.lastName} onChange={(e) => updateFamilyMember(i, "lastName", e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`fm-${i}-dob`} className="text-xs text-muted-foreground">Date of Birth *</Label>
                              <Input id={`fm-${i}-dob`} type="date" className="mt-1" value={fm.dob} onChange={(e) => updateFamilyMember(i, "dob", e.target.value)} min={DOB_MIN} max={todayIso()} />
                            </div>
                          </div>
                        ))}
                      </div>
                      {familyMembers.length < 4 && (
                        <Button type="button" variant="outline" size="sm" onClick={addFamilyMember} className="mt-3 w-full">
                          <Plus size={14} className="mr-1" /> Add family member ({familyMembers.length}/4)
                        </Button>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
                    Continue to payment <ChevronRight size={16} className="ml-1" />
                  </Button>
                </form>
              )}

              {step === "payment" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold mb-3">Payment</h2>
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Lock size={11} /> Card details
                      </p>
                      <div id="square-card-container" className="min-h-[90px]">
                        {!cardReady && (
                          <div className="flex items-center justify-center h-[90px]">
                            <Loader2 className="animate-spin text-muted-foreground" size={20} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button onClick={handlePayment} className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={submitting || !cardReady}>
                    {submitting ? (
                      <><Loader2 className="animate-spin mr-2" size={16} /> Processing…</>
                    ) : (
                      <><Lock size={14} className="mr-2" /> Pay {selected ? fmt(PRICES[selected.term][selected.plan]) : ""} CAD</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck size={13} className="text-green-500" />
                    Payments are processed securely via Square
                  </div>

                  <button onClick={() => setStep("intake")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
                    ← Return to information
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Order summary ── */}
            {selected && (
              <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/20 px-8 py-6 flex-shrink-0">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Order summary</h2>

                {/* Plan card */}
                <div className="flex items-start gap-3 mb-5 pb-5 border-b border-border/40">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    {selected.plan === "family" ? <Users className="text-primary" size={22} /> : <User className="text-primary" size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">
                      {selected.plan === "family" ? "Family" : "Single"} Membership
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{TERM_LABELS[selected.term]}</p>
                    <ul className="mt-2 space-y-0.5">
                      {PERKS[selected.term].map((p) => (
                        <li key={p} className="flex items-start gap-1 text-xs text-muted-foreground">
                          <Check size={10} className="text-primary mt-0.5 flex-shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="text-sm font-bold ml-2">{fmt(PRICES[selected.term][selected.plan])}</span>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{fmt(PRICES[selected.term][selected.plan])}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-border/40 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">{fmt(PRICES[selected.term][selected.plan])} <span className="text-xs font-normal text-muted-foreground">CAD</span></span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 border border-border/30 p-3 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <ShieldCheck size={13} className="text-green-500" /> What's included
                  </div>
                  <p>Unlimited access to all classes — Youth Rec, Rec, and Rock Steady for the full term.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={modalOpen === "terms"} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>By creating an account, purchasing a membership, or attending a class at Border City Boxing Club, you agree to these Terms.</p>
            <div>
              <h3 className="font-bold text-foreground mb-2">1. Eligibility</h3>
              <p>You must be at least 18 years old to create an account. Parents or legal guardians may create accounts on behalf of minors.</p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">2. Memberships and Payments</h3>
              <p>Memberships are sold in 1, 3, and 6-month terms. Payments are processed by Square. All prices are in Canadian dollars (CAD). Memberships do not auto-renew.</p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">3. Refunds and Cancellations</h3>
              <p>Memberships are generally non-refundable once the term has begun. We may, at our discretion, issue refunds for extenuating circumstances. Contact us at (226) 757-3988.</p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">4. Limitation of Liability</h3>
              <p>You assume all risks associated with your participation in boxing training and classes. Border City Boxing Club is not liable for injuries, damages, or losses arising from your participation.</p>
            </div>
            <p className="text-xs bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 rounded p-2">
              <strong>Note:</strong> These Terms are a working draft and must be reviewed by legal counsel before public launch.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waiver Modal */}
      <Dialog open={modalOpen === "waiver"} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Facility Waiver and Risk Assumption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">WAIVER OF LIABILITY AND ASSUMPTION OF RISK</p>
            <p>I acknowledge that boxing and martial arts training involve inherent risks of serious bodily injury, including but not limited to head trauma, fractures, muscle strains, and other injuries.</p>
            <div>
              <h3 className="font-bold text-foreground mb-2">I hereby:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Assume all risks associated with my participation in classes and training at Border City Boxing Club.</li>
                <li>Release and hold harmless Border City Boxing Club, its owners, coaches, and staff from any and all liability for injuries or damages arising from my participation.</li>
                <li>Confirm that I am in good physical health and capable of participating in boxing training, or have obtained medical clearance from a healthcare provider.</li>
                <li>Agree to follow all safety guidelines, use proper equipment, and listen to coach instructions.</li>
                <li>On behalf of any family members listed on my membership, confirm they have reviewed this waiver and agree to the same terms.</li>
              </ul>
            </div>
            <p className="text-xs bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 rounded p-2">
              <strong>Note:</strong> This Waiver is a working draft and must be reviewed by legal counsel before public launch.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews Section */}
      <section className="py-24 bg-card/30 border-t border-b border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">What Our Members Say</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of satisfied members who've transformed their lives at Border City Boxing Club.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl overflow-hidden border border-border/30 group relative">
              <img src="/images/BorderCityBoxingWindsorOntarioReview1.png" alt="Member review 1" className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden border border-primary/40 group relative scale-105">
              <img src="/images/BorderCityBoxingWindsorOntarioReview2.png" alt="Member review 2" className="w-full h-auto object-cover brightness-110 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden border border-border/30 group relative">
              <img src="/images/BorderCityBoxingWindsorOntarioReview3.png" alt="Member review 3" className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300" />
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">⭐ 4.7 out of 5 stars • 59 Google reviews</p>
            <a href="https://www.google.com/maps/place/Border+City+Boxing+Club/@42.3142,-83.0459,15z" target="_blank" rel="noreferrer" className="inline-block text-primary font-bold uppercase tracking-wider hover:underline">
              Read all reviews on Google Maps →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
