import { Link } from 'react-router-dom'
import { Flower2, ArrowLeft, Shield, Heart, AlertTriangle, MessageCircle } from 'lucide-react'

export default function SafetyPage() {
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

        <h1 className="font-heading text-4xl font-bold text-navy mb-2">Safety Guidelines</h1>
        <p className="text-navy/60 mb-10">
          Rebloom SA is built on trust, respect, and compassion. These guidelines help us
          keep this community safe for everyone.
        </p>

        <div className="space-y-10 text-navy/80 leading-relaxed">
          <section className="bg-white rounded-xl border border-warm-cream-dark p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-terracotta" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-navy">Be compassionate</h2>
            </div>
            <ul className="space-y-2">
              <li>Remember that every member is navigating grief in their own way and at their own pace.</li>
              <li>Approach conversations with empathy. What feels like a small comment may carry great weight.</li>
              <li>Respect boundaries. If someone isn't ready to share, don't push.</li>
              <li>Celebrate milestones — joining this community is itself a brave step.</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl border border-warm-cream-dark p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-terracotta" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-navy">Keep the community safe</h2>
            </div>
            <ul className="space-y-2">
              <li><strong>Be honest.</strong> Use your real name and accurate information in your profile.</li>
              <li><strong>Protect privacy.</strong> Never share another member's personal details outside of Rebloom.</li>
              <li><strong>No financial requests.</strong> Never ask members for money, loans, or financial assistance.</li>
              <li><strong>No commercial activity.</strong> Do not use Rebloom to promote products, services, or businesses.</li>
              <li><strong>No inappropriate content.</strong> Keep all messages respectful and appropriate.</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl border border-warm-cream-dark p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-terracotta" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-navy">What's not allowed</h2>
            </div>
            <ul className="space-y-2">
              <li>Harassment, bullying, threats, or intimidation of any kind.</li>
              <li>Hate speech, discrimination, or derogatory language.</li>
              <li>Impersonation or misrepresenting your identity.</li>
              <li>Scams, phishing, or attempts to deceive other members.</li>
              <li>Sharing sexually explicit or violent content.</li>
              <li>Creating multiple accounts.</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl border border-warm-cream-dark p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-terracotta" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-navy">If something doesn't feel right</h2>
            </div>
            <p className="mb-3">
              If you experience or witness behaviour that makes you uncomfortable or violates
              these guidelines, please reach out to us immediately:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:hello@rebloomsa.co.za" className="text-terracotta hover:underline">
                  hello@rebloomsa.co.za
                </a>
              </li>
              <li>
                <strong>WhatsApp:</strong> Use the WhatsApp button on our homepage.
              </li>
            </ul>
            <p className="mt-3">
              All reports are handled confidentially. We take every report seriously and will
              respond within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">Meeting in person</h2>
            <p>
              If you choose to meet a fellow member in person, please take sensible precautions:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Meet in a public place for the first few meetings.</li>
              <li>Let a trusted friend or family member know where you're going.</li>
              <li>Arrange your own transport.</li>
              <li>Trust your instincts — if something feels off, leave.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-navy mb-3">Consequences</h2>
            <p>
              Members who violate these guidelines may receive a warning, have their account
              suspended, or be permanently removed from Rebloom SA. Serious violations may be
              reported to the relevant authorities.
            </p>
          </section>

          <div className="bg-gradient-to-r from-bloom-pink/20 to-terracotta/10 rounded-xl p-6 text-center">
            <p className="font-heading text-lg text-navy italic">
              "This community exists because we chose connection over isolation.
              Let's protect that choice — for ourselves and for each other."
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
