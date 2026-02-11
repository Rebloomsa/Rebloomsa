import { Link } from 'react-router-dom'
import { Flower2, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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

        <h1 className="font-heading text-4xl font-bold text-navy mb-2">Terms of Service</h1>
        <p className="text-navy/50 mb-10 text-sm">Last updated: February 2026</p>

        <div className="prose-rebloom space-y-8 text-navy/80 leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">1. Acceptance of terms</h2>
            <p>
              By accessing or using Rebloom SA ("the Platform"), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">2. Eligibility</h2>
            <p>
              Rebloom SA is designed exclusively for widows and widowers residing in South Africa.
              By joining, you confirm that you are at least 18 years old and that you have
              experienced the loss of a spouse or life partner.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">3. Account approval</h2>
            <p>
              All applications are personally reviewed by our team. We reserve the right to
              approve or decline any application at our sole discretion to maintain the safety
              and integrity of the community.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">4. Community conduct</h2>
            <p>As a member of Rebloom SA, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Treat all members with respect, empathy, and kindness.</li>
              <li>Provide truthful information in your profile.</li>
              <li>Refrain from harassment, abuse, or threatening behaviour.</li>
              <li>Not solicit members for commercial purposes, scams, or spam.</li>
              <li>Not share other members' personal information outside the Platform.</li>
              <li>Report any behaviour that violates these terms or our <Link to="/safety" className="text-terracotta hover:underline">Safety Guidelines</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">5. Content</h2>
            <p>
              You retain ownership of content you submit (profile information, messages, etc.).
              By posting content, you grant Rebloom SA a non-exclusive licence to display it
              within the Platform for the purpose of operating the community.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">6. Account suspension and termination</h2>
            <p>
              We may suspend or terminate your account if you violate these terms, engage in
              behaviour that harms the community, or at your own request. You may request
              account deletion at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">7. Pricing</h2>
            <p>
              During our early access phase, Rebloom SA is free to join. If we introduce
              paid features in the future, we will notify existing members in advance and
              any paid features will be clearly identified.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">8. Limitation of liability</h2>
            <p>
              Rebloom SA is provided "as is". We do our best to maintain a safe and respectful
              community, but we cannot guarantee the behaviour of individual members. We are
              not liable for any damages arising from your use of the Platform or interactions
              with other members.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">9. Governing law</h2>
            <p>
              These terms are governed by the laws of the Republic of South Africa. Any disputes
              will be subject to the jurisdiction of the South African courts.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">10. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. We will notify members of material
              changes via email. Continued use of the Platform after changes constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">11. Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
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
