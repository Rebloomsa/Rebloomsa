import { AccordionItem } from './ui/accordion'
import { useFadeIn } from '@/hooks/useFadeIn'

const faqs = [
  {
    q: 'Who can join Rebloom SA?',
    a: 'Rebloom is exclusively for widows and widowers in South Africa. Our community is specifically designed for those who have lost a spouse and are looking for understanding, companionship, or meaningful connections.',
  },
  {
    q: 'How is Rebloom different from dating apps?',
    a: 'Unlike Tinder or Bumble, Rebloom is built on empathy, not swiping. Every member has experienced loss, every profile is manually verified, and our community is grief-informed. There\'s no pressure — just genuine connection.',
  },
  {
    q: 'How does the verification process work?',
    a: 'Every profile is personally reviewed by our founder, Darryl James. This manual screening ensures our community remains safe, authentic, and supportive. Verification typically takes within 24 hours.',
  },
  {
    q: 'Is Rebloom free?',
    a: 'Yes! During our early access phase, Rebloom is completely free to join. We believe everyone deserves access to a compassionate community.',
  },
  {
    q: 'How soon after my loss can I join?',
    a: 'There\'s no timeline requirement. Whether it\'s been 6 months or 10 years, you\'re welcome whenever you feel ready. Rebloom is about moving at your own pace.',
  },
  {
    q: 'Can I stay anonymous?',
    a: 'Absolutely. You can use a display name and control what information is visible on your profile. Your privacy and comfort are our top priorities.',
  },
]

export default function FAQ() {
  const fadeIn = useFadeIn()

  return (
    <section id="faq" className="py-24 sm:py-32 px-6 sm:px-8" ref={fadeIn.ref}>
      <div className={`max-w-2xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-navy/60 mb-16 max-w-lg mx-auto leading-relaxed">
          Everything you need to know about Rebloom
        </p>

        <div className="bg-white rounded-2xl shadow-md p-8 sm:p-10">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} title={faq.q}>
              {faq.a}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
