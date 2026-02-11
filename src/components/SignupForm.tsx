import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { useFadeIn } from '@/hooks/useFadeIn'
import { submitWaitlist } from '@/lib/supabase'
import { CheckCircle, Loader2, Heart } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const provinces = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape',
]

const ageRanges = ['30-39', '40-49', '50-59', '60-69', '70+']

export default function SignupForm() {
  const fadeIn = useFadeIn()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [referrerName, setReferrerName] = useState('')
  const [referralCode, setReferralCode] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    province: '',
    age_range: '',
    story: '',
  })

  // Read ?ref= from URL and validate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (!ref) return
    setReferralCode(ref)
    fetch(`${apiUrl}/api/referral/${encodeURIComponent(ref)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.firstName) setReferrerName(data.firstName)
      })
      .catch(() => {})
  }, [])

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) { setError('Please enter your name'); return false }
      if (!form.email.trim() || !form.email.includes('@')) { setError('Please enter a valid email'); return false }
    }
    if (step === 2) {
      if (!form.province) { setError('Please select your province'); return false }
      if (!form.age_range) { setError('Please select your age range'); return false }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await submitWaitlist({ ...form, referred_by: referralCode || undefined })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section id="signup" className="py-24 sm:py-32 px-6 sm:px-8" ref={fadeIn.ref}>
        <div className={`max-w-lg mx-auto ${fadeIn.className}`}>
          <Card className="text-center py-16 px-8">
            <CheckCircle className="h-16 w-16 text-hope-green mx-auto mb-6" />
            <h3 className="font-heading text-3xl font-bold text-navy mb-3">
              Welcome to Rebloom!
            </h3>
            <p className="text-navy/60 text-lg">
              You're on the waitlist. We'll be in touch soon with next steps.
            </p>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="signup" className="py-24 sm:py-32 px-6 sm:px-8 bg-white" ref={fadeIn.ref}>
      <div className={`max-w-lg mx-auto ${fadeIn.className}`}>
        {referrerName && (
          <div className="flex items-center justify-center gap-2 mb-6 bg-bloom-pink/20 rounded-full px-4 py-2 w-fit mx-auto">
            <Heart className="h-4 w-4 text-terracotta" />
            <span className="text-sm font-medium text-navy">Invited by {referrerName}</span>
          </div>
        )}

        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          Join the Waitlist
        </h2>
        <p className="text-center text-navy/60 mb-10 leading-relaxed">
          Free to join during our early access phase
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors duration-300 ${
                  s <= step ? 'bg-terracotta' : 'bg-warm-cream-dark'
                }`}
              />
              <p className={`text-xs mt-1 text-center ${s <= step ? 'text-terracotta font-medium' : 'text-navy/40'}`}>
                {s === 1 ? 'About You' : s === 2 ? 'Location' : 'Your Story'}
              </p>
            </div>
          ))}
        </div>

        <Card className="p-8">
          <div>
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Full Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Province</label>
                  <select
                    value={form.province}
                    onChange={(e) => update('province', e.target.value)}
                    className="w-full rounded-lg border border-warm-cream-dark bg-white px-4 py-3 text-navy focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-colors"
                  >
                    <option value="">Select your province</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Age Range</label>
                  <select
                    value={form.age_range}
                    onChange={(e) => update('age_range', e.target.value)}
                    className="w-full rounded-lg border border-warm-cream-dark bg-white px-4 py-3 text-navy focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-colors"
                  >
                    <option value="">Select age range</option>
                    {ageRanges.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Your Story <span className="text-navy/40">(optional)</span>
                </label>
                <textarea
                  value={form.story}
                  onChange={(e) => update('story', e.target.value)}
                  placeholder="Share a little about yourself and what you're looking for..."
                  rows={4}
                  className="w-full rounded-lg border border-warm-cream-dark bg-white px-4 py-3 text-navy placeholder:text-navy/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-colors resize-none"
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button type="button" disabled={submitting} onClick={handleSubmit} className="flex-1">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Joining...</>
                  ) : (
                    'Join Waiting List'
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
