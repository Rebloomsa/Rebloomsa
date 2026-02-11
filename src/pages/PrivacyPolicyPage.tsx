import { Link } from 'react-router-dom'
import { Flower2, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-cream">
      <header className="bg-white/80 backdrop-blur-sm border-b border-warm-cream-dark sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-navy font-heading text-xl font-bold">
            <Flower2 className="h-6 w-6 text-terracotta" />
            Rebloom SA
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-terracotta hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="font-heading text-4xl font-bold text-navy mb-2">Privacy Policy</h1>
        <p className="text-navy/50 mb-10 text-sm">Last updated: February 2026</p>

        <div className="prose-rebloom space-y-8 text-navy/80 leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">1. Who we are</h2>
            <p>
              Rebloom SA ("we", "us", "our") is a community platform for widows and widowers in
              South Africa. We are committed to protecting your personal information in accordance
              with the Protection of Personal Information Act, 2013 (POPIA) and other applicable
              South African legislation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">2. Information we collect</h2>
            <p>When you join Rebloom SA, we collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Account information:</strong> Your name, email address, province, and age range.</li>
              <li><strong>Profile information:</strong> Any biographical details you choose to share.</li>
              <li><strong>Messages:</strong> Content of messages exchanged with other members.</li>
              <li><strong>Usage data:</strong> Profile views, login activity, and feature usage.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">3. How we use your information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Operate and maintain the Rebloom SA community platform.</li>
              <li>Display your profile to other verified members.</li>
              <li>Facilitate messaging between members.</li>
              <li>Send you important updates about your account and the community.</li>
              <li>Send periodic community digests (you can opt out at any time).</li>
              <li>Respond to your enquiries and support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">4. Who can see your information</h2>
            <p>
              Your name, province, age range, and bio are visible to other approved Rebloom SA
              members. Your email address is never shown to other members. We do not sell, rent,
              or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">5. Data security</h2>
            <p>
              We use industry-standard security measures to protect your data, including encrypted
              connections (HTTPS), secure authentication, and access controls. Our database is
              hosted on Supabase with row-level security policies ensuring members can only
              access authorised data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">6. Your rights under POPIA</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Object to the processing of your personal information.</li>
              <li>Withdraw your consent at any time.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:hello@rebloomsa.co.za" className="text-terracotta hover:underline">
                hello@rebloomsa.co.za
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">7. Data retention</h2>
            <p>
              We retain your personal information for as long as your account is active. If you
              request account deletion, we will remove your data within 30 days, except where
              we are legally required to retain it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">8. Cookies and local storage</h2>
            <p>
              We use browser local storage to remember your login session and preferences.
              We do not use third-party tracking cookies or advertising trackers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">9. Changes to this policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify members of
              significant changes via email or an in-app notice.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">10. Contact us</h2>
            <p>
              If you have questions about this privacy policy or how we handle your data,
              please contact us at{' '}
              <a href="mailto:hello@rebloomsa.co.za" className="text-terracotta hover:underline">
                hello@rebloomsa.co.za
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
