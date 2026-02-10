import { useState, type FormEvent } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useFadeIn } from '@/hooks/useFadeIn'
import { submitNewsletter } from '@/lib/supabase'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function Newsletter() {
  const fadeIn = useFadeIn()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await submitNewsletter({ email })
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 sm:py-24 px-6 sm:px-8 bg-navy" ref={fadeIn.ref}>
      <div className={`max-w-xl mx-auto text-center ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl font-bold text-white mb-5">
          Stay in the Loop
        </h2>
        <p className="text-white/60 mb-10 leading-relaxed">
          Get updates on our launch, community stories, and helpful resources.
        </p>

        {success ? (
          <div className="flex items-center justify-center gap-3 text-hope-green">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">You're subscribed! Thank you.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-bloom-pink"
            />
            <Button type="submit" disabled={submitting} className="whitespace-nowrap">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
            </Button>
          </form>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    </section>
  )
}
