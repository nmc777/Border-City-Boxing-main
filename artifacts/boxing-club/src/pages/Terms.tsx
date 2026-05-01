export default function Terms() {
  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 uppercase">
          Terms of <span className="text-primary">Service</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Last updated: {new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 leading-relaxed">
        <p className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 rounded p-4 text-sm">
          <strong>Draft notice:</strong> These Terms are a working draft and have not yet been reviewed by legal
          counsel. They must be reviewed before public launch — particularly the liability waiver, refund, and
          dispute-resolution sections.
        </p>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">1. Agreement</h2>
          <p>
            These Terms govern your use of the Border City Boxing Club website, your membership, and your
            participation in our classes. By creating an account, purchasing a membership, or attending a
            class, you agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to create an account on your own behalf. Parents or legal
            guardians may create accounts and book classes on behalf of minors in their care.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">3. Memberships and payments</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Memberships are sold in 1-, 3-, and 6-month terms at the prices shown at checkout.</li>
            <li>Payments are processed by Square. By submitting payment you authorize the charge.</li>
            <li>All prices are in Canadian dollars (CAD) unless stated otherwise.</li>
            <li>Memberships do not auto-renew. You will be prompted to renew before each term ends.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">4. Refunds and cancellations</h2>
          <p>
            Memberships are generally non-refundable once the term has begun. We may, at our discretion, issue
            a pro-rated refund in cases of medical hardship, relocation, or other extenuating circumstances.
            Refund requests must be sent to <a href="mailto:contact@bordercityboxing.ca" className="text-primary">contact@bordercityboxing.ca</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">5. Class bookings and no-shows</h2>
          <p>
            Class spots are limited. Please cancel bookings you cannot attend so other members can take the
            spot. We reserve the right to suspend booking privileges for repeated no-shows.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">6. Code of conduct</h2>
          <p>
            Boxing is a contact sport practised in close quarters. We expect every member to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Treat coaches, staff, and fellow members with respect.</li>
            <li>Follow coach instructions for safety and technique.</li>
            <li>Use equipment as instructed and report any damage.</li>
            <li>Refrain from harassment, discrimination, or violence outside of supervised training.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate the membership of any member who endangers the
            safety or well-being of others, without refund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">7. Assumption of risk and waiver</h2>
          <p>
            Boxing, kickboxing, BJJ, and related martial arts carry an inherent risk of injury, including
            serious injury. By participating, you acknowledge these risks and agree that Border City Boxing
            Club, its coaches, employees, and contractors are not liable for injury sustained during training
            except in cases of gross negligence. A separate physical waiver is required before your first
            class.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">8. Account responsibility</h2>
          <p>
            You are responsible for keeping your password confidential and for any activity on your account.
            Notify us immediately at <a href="mailto:contact@bordercityboxing.ca" className="text-primary">contact@bordercityboxing.ca</a>
            if you believe your account has been compromised.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">9. Intellectual property</h2>
          <p>
            All content on this website — logos, photography, written copy, class names, and branding — is
            owned by Border City Boxing Club and may not be reproduced without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Border City Boxing Club's aggregate liability arising out
            of or relating to these Terms or your use of our services is limited to the amount you paid us in
            the twelve months preceding the event giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">11. Governing law</h2>
          <p>
            These Terms are governed by the laws of the Province of Ontario and the federal laws of
            Canada. Any dispute will be resolved in the courts of that province.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">12. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. The "Last updated" date will reflect any changes,
            and material changes will be communicated to current members by email. Continued use of our
            services after changes are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">13. Contact</h2>
          <p>
            Questions about these Terms? Email us at <a href="mailto:contact@bordercityboxing.ca" className="text-primary">contact@bordercityboxing.ca</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
