import { useState, useEffect } from 'react'
import { Flower2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { getWaitlistCount } from '@/lib/supabase'

export default function Hero() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    getWaitlistCount().then(setCount)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-bloom-pink/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-hope-green/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 sm:px-8 text-center py-24 sm:py-32">
        {/* Animated flower */}
        <div className="animate-bloom mb-10">
          <Flower2 className="h-20 w-20 text-terracotta mx-auto animate-float" strokeWidth={1.5} />
        </div>

        {/* Waitlist badge */}
        <Badge variant="pink" className="animate-gentle-pulse mb-8 text-sm">
          {count}+ South Africans on the waitlist
        </Badge>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-8">
          After loss, life doesn't end—
          <br />
          <span className="text-terracotta">it blooms again</span>
        </h1>

        <p className="text-lg sm:text-xl text-navy/70 max-w-xl mx-auto mb-12 leading-relaxed">
          South Africa's first compassionate community designed exclusively for widows
          and widowers seeking meaningful companionship.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Button
            size="lg"
            onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Join Our Community
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
