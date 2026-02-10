import { Heart, Shield, Clock } from 'lucide-react'
import { Card } from './ui/card'
import { useFadeIn } from '@/hooks/useFadeIn'

const values = [
  {
    icon: Heart,
    title: 'Understanding First',
    description: "Every member has experienced loss. There's instant empathy — no need to explain your journey.",
  },
  {
    icon: Shield,
    title: 'Safety & Privacy',
    description: '100% verified members. Manual approval by our founder. Private, secure messaging.',
  },
  {
    icon: Clock,
    title: 'No Pressure',
    description: 'Move at your own pace. Whether you seek companionship, friendship, or love — it\'s your choice.',
  },
]

export default function ValueProps() {
  const fadeIn = useFadeIn()

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8" ref={fadeIn.ref}>
      <div className={`max-w-5xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          Why Rebloom?
        </h2>
        <p className="text-center text-navy/60 mb-16 max-w-lg mx-auto leading-relaxed">
          A community built on Ubuntu — "I am because we are"
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          {values.map((v) => (
            <Card key={v.title} className="text-center hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 p-8">
              <div className="w-16 h-16 rounded-full bg-bloom-pink/20 flex items-center justify-center mx-auto mb-6">
                <v.icon className="h-8 w-8 text-terracotta" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-navy mb-4">{v.title}</h3>
              <p className="text-navy/60 leading-relaxed">{v.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
