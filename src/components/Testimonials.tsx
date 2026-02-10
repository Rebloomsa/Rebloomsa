import { Quote } from 'lucide-react'
import { Card } from './ui/card'
import { useFadeIn } from '@/hooks/useFadeIn'

const visions = [
  {
    quote: "A place where losing your partner of 32 years doesn't mean losing your future — where everyone just gets it.",
    theme: 'Understanding',
  },
  {
    quote: "Every interaction built on respect. No pressure, no judgement — just genuine human connection at your own pace.",
    theme: 'Respect',
  },
  {
    quote: "The comfort of not having to explain your grief. A community where shared experience is the foundation.",
    theme: 'Belonging',
  },
]

export default function Testimonials() {
  const fadeIn = useFadeIn()

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8" ref={fadeIn.ref}>
      <div className={`max-w-5xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          The Community We're Building
        </h2>
        <p className="text-center text-navy/60 mb-16 max-w-lg mx-auto leading-relaxed">
          Our vision for what Rebloom will feel like for every member
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          {visions.map((v) => (
            <Card key={v.theme} className="relative hover:shadow-lg transition-shadow duration-300 p-8">
              <Quote className="h-8 w-8 text-bloom-pink mb-5" />
              <p className="text-navy/70 leading-relaxed mb-8 italic">&ldquo;{v.quote}&rdquo;</p>
              <div className="border-t border-warm-cream-dark pt-5">
                <p className="font-semibold text-terracotta">{v.theme}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
