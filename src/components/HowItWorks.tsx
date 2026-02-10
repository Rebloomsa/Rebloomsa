import { UserPlus, ShieldCheck, HeartHandshake } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Share Your Story',
    description: 'Create a thoughtful profile that reflects who you are and what you\'re looking for.',
  },
  {
    icon: ShieldCheck,
    step: '02',
    title: 'Personal Review & Verification',
    description: 'Every profile is manually screened by our founder within 24 hours for safety and authenticity.',
  },
  {
    icon: HeartHandshake,
    step: '03',
    title: 'Connect & Rebloom',
    description: 'Browse verified profiles and connect with people who truly understand your journey.',
  },
]

export default function HowItWorks() {
  const fadeIn = useFadeIn()

  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-6 sm:px-8 bg-white" ref={fadeIn.ref}>
      <div className={`max-w-5xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          How It Works
        </h2>
        <p className="text-center text-navy/60 mb-20 max-w-lg mx-auto leading-relaxed">
          Three simple steps to begin your new chapter
        </p>

        <div className="grid md:grid-cols-3 gap-16">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {/* Connector line (hidden on mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-bloom-pink/50" />
              )}

              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-bloom-pink/20 flex items-center justify-center mx-auto mb-6">
                  <s.icon className="h-10 w-10 text-terracotta" />
                </div>
                <span className="text-terracotta font-bold text-sm tracking-wider">{s.step}</span>
                <h3 className="font-heading text-xl font-semibold text-navy mt-3 mb-4">{s.title}</h3>
                <p className="text-navy/60 leading-relaxed max-w-xs mx-auto">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
