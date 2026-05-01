export default function Privacy() {
  return (
    <div className="min-h-screen pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 uppercase">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Last updated: {new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 leading-relaxed">
        <p className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 rounded p-4 text-sm">
          <strong>Draft notice:</strong> This policy is a working draft and has not yet been reviewed by legal counsel.
          It must be reviewed for PIPEDA compliance before public launch.
        </p>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">1. Who we are</h2>
          <p>
            Border City Boxing Club ("we," "us," "our") operates this website and the membership and class
            booking services available through it. We are based in Canada and our handling of personal
            information is governed by Canada's Personal Information Protection and Electronic Documents Act
            (PIPEDA) and applicable provincial privacy legislation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">2. Information we collect</h2>
          <p>When you create an account, book a class, or purchase a membership, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account details: name, email address, password (stored hashed), date of birth.</li>
            <li>Contact and billing details: phone number, mailing address.</li>
            <li>Membership and booking history: classes booked, attendance, plan and term selected.</li>
            <li>Payment information: handled directly by Square — we never see or store your full card number.</li>
            <li>Technical data: IP address, browser type, and session cookies needed to keep you logged in.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">3. How we use it</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To create and manage your account and bookings.</li>
            <li>To process membership payments and issue receipts.</li>
            <li>To send transactional emails (password resets, booking confirmations, payment receipts).</li>
            <li>To send newsletters and class announcements, only if you opt in.</li>
            <li>To keep records required for tax, accounting, and dispute-resolution purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">4. Who we share it with</h2>
          <p>We share the minimum personal information needed with the following service providers:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Square, Inc.</strong> — payment processing. Card data is tokenized in your browser and sent directly to Square.</li>
            <li><strong>Amazon Web Services (AWS SES)</strong> — sending transactional email.</li>
            <li><strong>Mailchimp</strong> — newsletter delivery (only if you opt in).</li>
            <li><strong>Geoapify</strong> — address autocomplete during signup.</li>
          </ul>
          <p>We do not sell your personal information. We do not share it with advertisers.</p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">5. How we protect it</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Passwords are hashed with bcrypt before storage.</li>
            <li>All traffic is served over HTTPS.</li>
            <li>Session cookies are httpOnly and marked secure in production.</li>
            <li>Access to administrative tools is restricted and rate-limited.</li>
            <li>Card numbers never touch our servers — Square handles tokenization end-to-end.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">6. Your rights</h2>
          <p>
            Under PIPEDA you have the right to access the personal information we hold about you, correct
            inaccuracies, and ask us to delete information that is no longer needed for the purposes for which
            it was collected. To make a request, contact our Privacy Officer at the address below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">7. Retention</h2>
          <p>
            We keep account and transaction records for as long as you have an active membership and for a
            reasonable period afterward to satisfy tax, accounting, and dispute-resolution obligations
            (typically seven years for financial records).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">8. Cookies</h2>
          <p>
            We use first-party session cookies that are strictly necessary to keep you logged in. We do not
            use third-party advertising or analytics cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">9. Changes to this policy</h2>
          <p>
            We will post any changes here and update the "Last updated" date. Material changes will be
            communicated by email to current members.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold uppercase text-foreground">10. Contact</h2>
          <p>
            Privacy Officer — Border City Boxing Club<br />
            Email: privacy@bordercityboxing.ca<br />
            Mail: 1072 Drouillard Rd, Windsor, ON N8Y 2P8
          </p>
        </section>
      </div>
    </div>
  );
}
