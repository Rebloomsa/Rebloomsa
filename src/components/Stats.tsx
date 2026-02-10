import { useState, useEffect } from 'react'
import { useFadeIn } from '@/hooks/useFadeIn'
import { getWaitlistCount } from '@/lib/supabase'

export default function Stats() {
  const fadeIn = useFadeIn()
  const [count, setCount] = useState(0)

  useEffect(() => {
    getWaitlistCount().then(setCount)
  }, [])

  const stats = [
    { value: `${count}+`, label: 'On Waitlist' },
    { value: '9', label: 'Provinces Covered' },
    { value: '30+', label: 'Age Groups Welcome' },
    { value: '1st', label: 'Of Its Kind in SA' },
  ]

  return (
    <section className="py-20 sm:py-24 px-6 sm:px-8 bg-bloom-pink/20" ref={fadeIn.ref}>
      <div className={`max-w-4xl mx-auto ${fadeIn.className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-4xl sm:text-5xl font-bold text-terracotta mb-3">
                {s.value}
              </p>
              <p className="text-navy/60 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
