import { Check, X, Minus } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const features = [
  { label: 'Exclusive to widows/widowers', rebloom: true, dating: false, facebook: false },
  { label: 'Manual verification', rebloom: true, dating: false, facebook: false },
  { label: 'Grief-informed community', rebloom: true, dating: false, facebook: 'partial' },
  { label: 'No swiping culture', rebloom: true, dating: false, facebook: true },
  { label: 'Private messaging', rebloom: true, dating: true, facebook: false },
  { label: 'Professional moderation', rebloom: true, dating: 'partial', facebook: false },
  { label: 'South African focused', rebloom: true, dating: false, facebook: 'partial' },
]

function StatusIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-5 w-5 text-hope-green mx-auto" />
  if (value === false) return <X className="h-5 w-5 text-terracotta/50 mx-auto" />
  return <Minus className="h-5 w-5 text-navy/30 mx-auto" />
}

export default function ComparisonTable() {
  const fadeIn = useFadeIn()

  return (
    <section id="comparison" className="py-24 sm:py-32 px-6 sm:px-8" ref={fadeIn.ref}>
      <div className={`max-w-3xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          Why Choose Rebloom?
        </h2>
        <p className="text-center text-navy/60 mb-16 max-w-lg mx-auto leading-relaxed">
          See how we compare to other platforms
        </p>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-md overflow-hidden">
            <thead>
              <tr className="bg-navy text-white">
                <th className="text-left py-5 px-6 font-heading text-lg font-semibold">Feature</th>
                <th className="py-5 px-5 font-heading text-lg font-semibold">Rebloom SA</th>
                <th className="py-5 px-5 font-heading text-lg font-semibold">Dating Apps</th>
                <th className="py-5 px-5 font-heading text-lg font-semibold">FB Groups</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.label} className={i % 2 === 0 ? 'bg-warm-cream/50' : 'bg-white'}>
                  <td className="py-5 px-6 text-navy font-medium">{f.label}</td>
                  <td className="py-5 px-5"><StatusIcon value={f.rebloom} /></td>
                  <td className="py-5 px-5"><StatusIcon value={f.dating} /></td>
                  <td className="py-5 px-5"><StatusIcon value={f.facebook} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
