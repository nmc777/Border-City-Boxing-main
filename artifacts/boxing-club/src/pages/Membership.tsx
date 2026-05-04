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
import { Check, User, Users, Sparkles, Loader2, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AddressSuggestion = {
  formatted: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string;

declare global {
  interface Window {
    Square?: any;
  }
}

type Plan = "single" | "family";
type Term = 1 | 3 | 6;

const PRICES: Record<Term, Record<Plan, number>> = {
  1: { single: 75,  family: 125 },
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
  6: ["All classes included", "Best value — biggest savings", "Priority booking"],
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

function AddressAutocomplete({
  value,
  countryCode,
  onChange,
  onSelect,
}: {
  value: string;
  countryCode: string;
  onChange: (v: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setError("");
      setOpen(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        setError("");
        const filter = `countrycode:${countryCode.toLowerCase()}`;
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&filter=${filter}&format=json&apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Geoapify API error:", res.status, res.statusText);
          setError("Address lookup failed. Please try again.");
          return;
        }
        const data = await res.json();
        const results = (data.results || [])
          .filter((r: any) => r.housenumber && r.street)
          .slice(0, 6)
          .map((r: any) => ({
            formatted: r.formatted,
            addressLine1: `${r.housenumber} ${r.street}`,
            city: r.city || r.town || r.village || "",
            province: r.state_code || r.state || "",
            postalCode: r.postcode || "",
            country: r.country_code?.toUpperCase() || countryCode,
          }));
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch (err) {
        console.error("Geoapify error:", err);
        setError("Address lookup error. Check your connection.");
      }
    }, 250);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, countryCode]);

  return (
    <div className="relative mt-1">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Start typing your address..."
        className=""
        autoComplete="off"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Suggestions</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              // Use onMouseDown so the click registers before the input blur fires,
              // and skip onChange — the parent's onSelect already owns addressLine1.
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(s);
                setOpen(false);
                setSuggestions([]);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm border-b border-border/30 last:border-0 transition-colors"
            >
              <span className="text-foreground">{s.formatted}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  addressValidated: false,
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

    if (!intake.addressValidated) {
      toast({
        title: "Invalid address",
        description: "Please select an address from the dropdown suggestions.",
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {step === "intake" ? "Your Details" : "Payment"}
            </DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  <span className="text-foreground font-bold">{fmt(PRICES[selected.term][selected.plan])}</span>
                  {" — "}
                  {TERM_LABELS[selected.term]} {selected.plan === "family" ? "Family" : "Single"} Plan
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {step === "intake" && (
            <form onSubmit={handleIntakeSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="intake-first">First Name *</Label>
                  <Input id="intake-first" className="mt-1" value={intake.firstName} onChange={set("firstName")} />
                </div>
                <div>
                  <Label htmlFor="intake-last">Last Name *</Label>
                  <Input id="intake-last" className="mt-1" value={intake.lastName} onChange={set("lastName")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="intake-email">Email *</Label>
                  <Input id="intake-email" type="email" className="mt-1" value={intake.email} onChange={set("email")} />
                </div>
                <div>
                  <Label htmlFor="intake-phone">Phone *</Label>
                  <Input id="intake-phone" type="tel" className="mt-1" value={intake.phone} onChange={set("phone")} placeholder="555-555-5555" />
                </div>
              </div>

              <div>
                <Label htmlFor="intake-dob">Date of Birth *</Label>
                <Input id="intake-dob" type="date" className="mt-1" value={intake.dob} onChange={set("dob")} min={DOB_MIN} max={todayIso()} />
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Billing Address</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="intake-country">Country/Region *</Label>
                    <select
                      id="intake-country"
                      value={intake.country}
                      onChange={(e) => setIntake({ ...intake, country: e.target.value, addressLine1: "", city: "", province: "", postalCode: "", addressValidated: false })}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="intake-addr1">Address *</Label>
                    <AddressAutocomplete
                      value={intake.addressLine1}
                      countryCode={intake.country}
                      onChange={(v) =>
                        setIntake((prev) => ({ ...prev, addressLine1: v, addressValidated: false }))
                      }
                      onSelect={(s) =>
                        setIntake((prev) => ({
                          ...prev,
                          addressLine1: s.addressLine1,
                          city: s.city,
                          province: s.province,
                          postalCode: s.postalCode,
                          addressValidated: true,
                        }))
                      }
                    />
                    {intake.addressLine1 && !intake.addressValidated && (
                      <p className="text-xs text-destructive mt-1">Select an address from the dropdown</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="intake-addr2">Apt / Unit (optional)</Label>
                    <Input id="intake-addr2" className="mt-1" value={intake.addressLine2} onChange={set("addressLine2")} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="intake-city">City *</Label>
                      <Input id="intake-city" className="mt-1" value={intake.city} onChange={set("city")} />
                    </div>
                    <div>
                      <Label htmlFor="intake-province">{intake.country === "US" ? "State" : "Province"} *</Label>
                      <select
                        id="intake-province"
                        value={intake.province}
                        onChange={(e) => setIntake({ ...intake, province: e.target.value })}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select {intake.country === "US" ? "state" : "province"}…</option>
                        {(intake.country === "US" ? US_STATES : CA_PROVINCES).map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="intake-postal">{intake.country === "US" ? "ZIP Code" : "Postal Code"} *</Label>
                    <Input id="intake-postal" className="mt-1" value={intake.postalCode} onChange={set("postalCode")} placeholder={intake.country === "US" ? "12345" : "A1A 1A1"} />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={intake.acceptedTerms}
                  onChange={(e) => setIntake({ ...intake, acceptedTerms: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-muted-foreground">
                  I accept the <span className="text-foreground font-medium">Terms and Conditions</span>.
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={intake.acceptedWaiver}
                  onChange={(e) => setIntake({ ...intake, acceptedWaiver: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-muted-foreground">
                  I accept the <span className="text-foreground font-medium">Facility Waiver</span> and assume the risks of training,
                  on behalf of myself and any family members listed below.
                </span>
              </label>

              {selected?.plan === "family" && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Family Members on Plan
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add 2 to 4 family members covered by this plan. They'll be sign-in-able at the front desk by name.
                  </p>
                  <div className="space-y-4">
                    {familyMembers.map((fm, i) => (
                      <div key={i} className="rounded-md border border-border/50 bg-muted/20 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                            Family Member {i + 1}
                            {i < 2 ? <span className="text-destructive ml-1">*</span> : null}
                          </p>
                          {i >= 2 && (
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(i)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label={`Remove family member ${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`fm-${i}-first`} className="text-xs">First Name *</Label>
                            <Input
                              id={`fm-${i}-first`}
                              className="mt-1"
                              value={fm.firstName}
                              onChange={(e) => updateFamilyMember(i, "firstName", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`fm-${i}-last`} className="text-xs">Last Name *</Label>
                            <Input
                              id={`fm-${i}-last`}
                              className="mt-1"
                              value={fm.lastName}
                              onChange={(e) => updateFamilyMember(i, "lastName", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor={`fm-${i}-dob`} className="text-xs">Date of Birth *</Label>
                          <Input
                            id={`fm-${i}-dob`}
                            type="date"
                            className="mt-1"
                            value={fm.dob}
                            onChange={(e) => updateFamilyMember(i, "dob", e.target.value)}
                            min={DOB_MIN}
                            max={todayIso()}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {familyMembers.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFamilyMember}
                      className="mt-3 w-full"
                    >
                      <Plus size={14} className="mr-1" /> Add another family member ({familyMembers.length}/4)
                    </Button>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                Continue to Payment →
              </Button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Card Details</p>
                <div id="square-card-container" className="min-h-[90px]">
                  {!cardReady && (
                    <div className="flex items-center justify-center h-[90px]">
                      <Loader2 className="animate-spin text-muted-foreground" size={20} />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Test card: <span className="font-mono">4111 1111 1111 1111</span> · any future date · any CVV
              </p>

              <Button
                onClick={handlePayment}
                className="w-full"
                size="lg"
                disabled={submitting || !cardReady}
              >
                {submitting ? (
                  <><Loader2 className="animate-spin mr-2" size={16} /> Processing...</>
                ) : (
                  `Pay ${selected ? fmt(PRICES[selected.term][selected.plan]) : ""} CAD`
                )}
              </Button>

              <button
                onClick={() => setStep("intake")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
