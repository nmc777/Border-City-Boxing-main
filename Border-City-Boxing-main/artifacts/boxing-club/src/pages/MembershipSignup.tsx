import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Plan = "single" | "family" | "rock_steady" | "womens_only";

interface Participant {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isUnder18: boolean;
  guardianName: string;
  guardianConsent: boolean;
}

const PLAN_LABELS: Record<Plan, string> = {
  single: "Single Membership",
  family: "Family Membership",
  rock_steady: "Rock Steady Membership",
  womens_only: "Women's Only Membership",
};

function calcTotal(plan: Plan, count: number): number {
  if (plan === "rock_steady" || plan === "womens_only") return 75;
  if (plan === "single") return 125;
  if (count <= 2) return 125;
  if (count === 3) return 185;
  return 245;
}

const STEPS = ["Verification", "Terms & Conditions", "Facility Waiver", "Finalize"];

const TERMS_TEXT = `TERMS AND CONDITIONS

This contract ("Contract") is formulated between Border City Boxing, headquartered at 1072 Drouillard Rd, Windsor, Ontario, N8Y 2P8, Canada, and the individual ("Participant") who agrees to abide by the stipulations herein.

Membership Dues and Remittances:
All membership dues are unalterable, non-refundable and recurring. Membership dues are to be settled in full. A six-month membership necessitates a minimum engagement of six (6) months, consisting of thirteen (13) bi-weekly remittances. Cancellation of membership should be communicated in written form and will be effective after a period of thirty (30) business days.

Membership Pause:
Membership and periodic payments cannot be momentarily put on hold or paused until the completion of the minimum engagement period, unless under the circumstance of a government-imposed lockdown or if Border City Boxing is unable to offer supervised or unsupervised services for a period exceeding 14 days.

Participation and Payments:
In case of a declined or insufficient payment, the Participant or their child will be prohibited from attending classes until the pending balance is fully settled, and a dependable alternative payment method is established. Non-fulfillment of the agreed-upon membership dues may result in the Participant's account being transferred to a collections agency. In case of any dispute resulting from the Participant's non-payment of membership dues or any other pending amounts, the winning party shall have the right to recoup all actual attorney's fees and costs incurred.

Termination and Reparations:
Under specific circumstances, this membership contract can be terminated before the agreed minimum payment duration for a fee of $150.00+HST per family client. Termination fees will be assessed on an individual basis and solely at the discretion of Border City Boxing. Border City Boxing retains the right to terminate the membership of any individual at its exclusive discretion. Border City Boxing has the right to immediately terminate the membership of any individual who attempts to bypass Border City Boxing's regulations or is involved in harmful conduct towards members, guests, or property. Any individual inflicting damage to Border City Boxing's equipment or property, whether deliberate, unintentional, or due to negligent conduct, will be accountable for all replacement costs.

Payment Consent:
Upon signing this contract, the Participant grants Border City Boxing permission to collect membership payments as per this contract, including periodic payments and one-off payments, from the specified bank account or credit card. The Participant consents to provide an alternate payment method if the provided credit card or bank account becomes unreliable.

Trial Period and Access Key:
All members are required to complete a 10-day trial period prior to becoming eligible for an access key to the facility. Adult members above the age of 18 may be granted access keys on an individual basis, subject to Border City Boxing's discretion. Access keys permit eligible members to access the facility without supervision or lose their rights to unsupervised access outside of Border City Boxing's scheduled programs.

Facility Protocols and Guidelines:
All members and guests are required to comply with the facility's regulations, policies, and any general or safety guidelines set by Border City Boxing.

Program Adjustments and Availability:
Border City Boxing's programs, class timetable, and operation hours may be altered without prior notice.

Membership Suitability and Requirements:
Membership at Border City Boxing is not available to transient visitors to the region or out-of-town guests. This includes the 10-day satisfaction guarantee. If you wish to attend classes during your visit, you must purchase a day pass, subject to availability.

Membership Termination and Refund Policy:
If you are not satisfied with your membership, you have a 10-day period from the date of signing this contract to terminate your membership without penalty. However, please be advised that the initial payment made upon signing will not be refunded. Upon termination, you will immediately lose access to attend classes or use the facility. To begin a termination, please send a written request via email to contact@bordercityboxingclub.com.

General Assertion and Dependence:
By checking this box, you affirm that you have not relied on any oral or written assertions or statements made by any directors, officers, shareholders, volunteers, employees, subcontractors, instructors, or representatives of Border City Boxing other than what is expressly stated in this contract.`;

const WAIVER_TEXT = `BORDER CITY BOXING CLUB — WAIVER, ACKNOWLEDGEMENT AND RELEASE

In signing this document, you are waiving the right to bring a court action to recover compensation or obtain any other remedy for; personal injuries, damage to property, loss of property, accident of any kind, death, arising out of your use of Border City Boxing's facilities, equipment, your participation in classes or activities sponsored by Border City Boxing (including but not limited to tournaments, boot camps, seminars, clinics, workshops, martial arts classes, and special events), whether supervised or unsupervised. You must be 18 years of age or older to sign this Acknowledgement and Release, otherwise a parent or guardian must sign on your behalf.

ACKNOWLEDGEMENT AND RELEASE

Border City Boxing operates facilities ("Gym") and equipment located at 1072 Drouillard Rd, Windsor, Ontario, N8Y 2P8, Canada and may provide classes or activities whether supervised or unsupervised by Border City Boxing's agents (collectively the "Gym Activities"). AND WHEREAS an essential condition for Border City Boxing permitting me to use its facilities and/or participate in Gym Activities, I have agreed to give this Acknowledgement and Release.

NOW THEREFORE, IN CONSIDERATION of Border City Boxing permitting me to use the Gym and participate in Gym Activities, I, for myself, my personal representatives, assigns, and heirs:

(1) Acknowledge, agree and represent that I understand the nature of the Gym and Gym Activities and that I am in good health and in proper physical condition to use the Gym and participate in Gym Activities.

(2) Fully understand that: a) The Gym and Gym Activities may involve serious risks and dangers of serious bodily injury, including permanent disability, paralysis, and death (the "risks"). b) These risks may be caused by my own action, the actions or inactions of others using the Gym or participating in the Gym Activities, the condition of the Gym or the condition in which the Gym Activities take place, or the negligence of the releases listed below. c) There may be other special or unusual risks associated with the Gym or Gym Activities, including social or economic losses, either known to me or not readily foreseeable at this time AND I FULLY ACCEPT AND ASSUME ALL SUCH RISKS AND ALL RESPONSIBILITY FOR ALL LOSSES, COSTS, AND DAMAGES I MAY INCUR AS A RESULT OF MY USE OF THE GYM OR MY PARTICIPATION IN THE GYM ACTIVITIES BOTH NOW AND IN THE FUTURE.

(3) Agree and warrant that I will examine and inspect all gym equipment and each Gym Activity in which I take part and that, if I observe any condition which I consider to be hazardous or dangerous, I will notify the proper authority in charge of the Gym or Gym Activities, as the context requires, and will refuse to use such equipment or take part in such Gym Activities until the condition has been corrected to my satisfaction.

(4) Hereby release, discharge and covenant not to sue Border City Boxing, its officers, directors, shareholders, employees, volunteers, instructors, participants in Gym Activities, users of the Gym, assigns, owners and lessors of the facility where the Gym is located, all designers, manufacturers and installers of equipment and other fixtures located at the Gym's facilities (collectively referred to as the "releases") from all liability, claims, causes of action, demands, losses or damages on my account caused, or alleged to have been caused, by in whole or in part by my use of the Gym, my participation in Gym Activities or the negligence of the releases or otherwise. I further agree that if despite executing this acknowledgement and release I or anyone on my behalf, makes a claim against any of the releases, whether directly or indirectly, I will indemnify, save and hold harmless each of the releases from any litigation expense, solicitor fee, loss, liability, damage or cost which may be incurred as a result of such claim.

(5) CHOICE OF LAW AND ATTORNMENT — This acknowledgement and release shall be governed by and construed in accordance with the laws of the province of Ontario and the laws of Canada. I agree that the courts of the province of Ontario will have exclusive jurisdiction to determine all disputes and claims arising between the parties.

(6) SUCCESSORS AND ASSIGNS — This acknowledgement and release shall be binding upon myself, my personal representatives, assigns, and heirs and shall endure to the benefit of Border City Boxing and its respective heirs, executors, administrators, directors, successors and assigns.

(7) I understand and agree that I may be photographed, videotaped, contacted by email or other means, or have my likeness recorded by other means and used for commercial purposes, including but not limited to marketing, instructional products, and internet applications.

I have read this acknowledgement and release, fully understand its terms and understand that I have given up substantial rights by signing it, and have signed it freely and without any inducement or assistance of any nature and intend it to be irrevocable and unconditional release of all liability to the greatest extent allowed by law and agree that if any portion of this acknowledgement and release is held to be invalid, the balance of the acknowledgement and release shall continue in full force and effect.`;

function emptyParticipant(): Participant {
  return { firstName: "", lastName: "", dateOfBirth: "", isUnder18: false, guardianName: "", guardianConsent: false };
}

export default function MembershipSignup() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const plan = (params.get("plan") ?? "single") as Plan;

  const [step, setStep] = useState(0);
  const [participantCount, setParticipantCount] = useState(plan === "family" ? 2 : 1);
  const [participants, setParticipants] = useState<Participant[]>([emptyParticipant()]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);
  const [finalAck, setFinalAck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal();
      navigate("/membership");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const count = plan === "family" ? participantCount : 1;
    setParticipants((prev) => {
      const next = [...prev];
      while (next.length < count) next.push(emptyParticipant());
      return next.slice(0, count);
    });
  }, [participantCount, plan]);

  const updateParticipant = (index: number, field: keyof Participant, value: string | boolean) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const step1Valid = participants.every((p) => {
    const base = p.firstName.trim() && p.lastName.trim() && p.dateOfBirth.trim();
    if (p.isUnder18) return base && p.guardianName.trim() && p.guardianConsent;
    return base;
  });

  const total = calcTotal(plan, participantCount);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const applyRes = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan,
          participants: participants.map((p) => ({
            firstName: p.firstName.trim(),
            lastName: p.lastName.trim(),
            dateOfBirth: p.dateOfBirth,
            isUnder18: p.isUnder18,
            guardianName: p.guardianName.trim() || undefined,
            guardianConsent: p.guardianConsent,
          })),
          agreedToTerms: true,
          agreedToWaiver: true,
        }),
      });

      const applyData = await applyRes.json();
      if (!applyRes.ok) {
        toast({ title: "Error", description: applyData.error ?? "Failed to save application.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const checkoutRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ applicationId: applyData.applicationId }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        toast({ title: "Payment Error", description: checkoutData.error ?? "Failed to initiate payment.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      window.location.href = checkoutData.checkoutUrl;
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/30" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* STEP 1: Verification */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-display font-bold uppercase mb-1">Verification <span className="text-primary">Form</span></h2>
                <p className="text-muted-foreground">Plan: <span className="font-semibold text-foreground">{PLAN_LABELS[plan]}</span></p>
              </div>

              {plan === "family" && (
                <Card>
                  <CardContent className="pt-6">
                    <Label>Number of family members</Label>
                    <Select value={String(participantCount)} onValueChange={(v) => setParticipantCount(Number(v))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 members — $125/mo</SelectItem>
                        <SelectItem value="3">3 members — $185/mo</SelectItem>
                        <SelectItem value="4">4 members — $245/mo</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {participants.map((p, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
                      {plan === "family" ? `Participant ${i + 1}` : "Your Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input className="mt-1" value={p.firstName} onChange={(e) => updateParticipant(i, "firstName", e.target.value)} placeholder="Jane" required />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input className="mt-1" value={p.lastName} onChange={(e) => updateParticipant(i, "lastName", e.target.value)} placeholder="Smith" required />
                      </div>
                    </div>
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input className="mt-1" type="date" value={p.dateOfBirth} onChange={(e) => updateParticipant(i, "dateOfBirth", e.target.value)} required />
                    </div>
                    <div>
                      <Label className="mb-2 block">Participant Is Under The Age Of 18 *</Label>
                      <RadioGroup
                        value={p.isUnder18 ? "yes" : "no"}
                        onValueChange={(v) => updateParticipant(i, "isUnder18", v === "yes")}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`age-no-${i}`} />
                          <Label htmlFor={`age-no-${i}`} className="font-normal cursor-pointer">No</Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="yes" id={`age-yes-${i}`} className="mt-0.5" />
                          <Label htmlFor={`age-yes-${i}`} className="font-normal cursor-pointer leading-snug">
                            Yes, and I understand I will need a signature from Parent/Legal Guardian
                            <span className="block text-xs text-muted-foreground">(Parent/Legal Guardian signature requested on file at facility)</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {p.isUnder18 && (
                      <div className="space-y-3 border-l-2 border-primary/30 pl-4">
                        <div>
                          <Label>Parent/Guardian Full Name *</Label>
                          <Input className="mt-1" value={p.guardianName} onChange={(e) => updateParticipant(i, "guardianName", e.target.value)} placeholder="Guardian name" />
                        </div>
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`guardian-consent-${i}`}
                            checked={p.guardianConsent}
                            onCheckedChange={(v) => updateParticipant(i, "guardianConsent", !!v)}
                          />
                          <Label htmlFor={`guardian-consent-${i}`} className="font-normal cursor-pointer text-sm leading-snug">
                            I, the Parent/Legal Guardian, consent to this participant's membership and agree to all terms on their behalf.
                          </Label>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} disabled={!step1Valid} className="gap-2">
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Terms & Conditions */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-display font-bold uppercase mb-1">Terms & <span className="text-primary">Conditions</span></h2>
                <p className="text-muted-foreground text-sm">Please read the full terms and conditions carefully before proceeding.</p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="h-80 overflow-y-auto bg-secondary/20 rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border border-border/50">
                    {TERMS_TEXT}
                  </div>
                  <div className="flex items-start gap-3 mt-5">
                    <Checkbox
                      id="agree-terms"
                      checked={agreedToTerms}
                      onCheckedChange={(v) => setAgreedToTerms(!!v)}
                    />
                    <Label htmlFor="agree-terms" className="cursor-pointer font-semibold leading-snug">
                      I have read, understood, and agree to the Terms and Conditions of Border City Boxing Club.
                    </Label>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button onClick={() => setStep(2)} disabled={!agreedToTerms} className="gap-2">
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Waiver */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-display font-bold uppercase mb-1">Facility <span className="text-primary">Waiver</span></h2>
                <p className="text-muted-foreground text-sm">Please read the waiver carefully before proceeding.</p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="h-80 overflow-y-auto bg-secondary/20 rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border border-border/50">
                    {WAIVER_TEXT}
                  </div>
                  <div className="flex items-start gap-3 mt-5">
                    <Checkbox
                      id="agree-waiver"
                      checked={agreedToWaiver}
                      onCheckedChange={(v) => setAgreedToWaiver(!!v)}
                    />
                    <Label htmlFor="agree-waiver" className="cursor-pointer font-semibold leading-snug">
                      I have read, understood, and agree to the Border City Boxing Club Waiver, Acknowledgement and Release.
                    </Label>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!agreedToWaiver} className="gap-2">
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Finalize */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-display font-bold uppercase mb-1">Review & <span className="text-primary">Finalize</span></h2>
                <p className="text-muted-foreground text-sm">Review your information before proceeding to checkout.</p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <div>
                      <p className="font-bold text-lg">{PLAN_LABELS[plan]}</p>
                      {plan === "family" && <p className="text-sm text-muted-foreground">{participantCount} members</p>}
                    </div>
                    <p className="text-2xl font-display font-bold text-primary">${total}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Participants</p>
                    {participants.map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-lg px-4 py-3">
                        <div>
                          <p className="font-semibold">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-muted-foreground">DOB: {p.dateOfBirth}{p.isUnder18 ? " · Under 18 — Guardian: " + p.guardianName : ""}</p>
                        </div>
                        {p.isUnder18 && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">Under 18</span>}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <Check size={14} /> Terms & Conditions agreed
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <Check size={14} /> Facility Waiver agreed
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="final-ack"
                      checked={finalAck}
                      onCheckedChange={(v) => setFinalAck(!!v)}
                    />
                    <Label htmlFor="final-ack" className="cursor-pointer font-semibold leading-snug">
                      I acknowledge that I have read, understand and agree to all terms and wish to proceed to checkout.
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={!finalAck || isSubmitting}
                  size="lg"
                  className="gap-2 px-8"
                >
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Proceed To Checkout <ChevronRight size={16} /></>}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
