// Membership pricing matrix. Prices are placeholders — edit here and the rest of the app picks it up.
export type MembershipPlan = "single" | "family";
export type MembershipTerm = 1 | 3 | 6;

export const MEMBERSHIP_PRICES: Record<MembershipTerm, Record<MembershipPlan, number>> = {
  1: { single: 100,   family: 12500 },  // single 1-month set to $1.00 for production testing — change back to 7500 after test
  3: { single: 20000, family: 34000 },
  6: { single: 37500, family: 62500 },
};

export function getMembershipPriceCents(term: MembershipTerm, plan: MembershipPlan): number {
  return MEMBERSHIP_PRICES[term][plan];
}

export function isValidTerm(n: unknown): n is MembershipTerm {
  return n === 1 || n === 3 || n === 6;
}
