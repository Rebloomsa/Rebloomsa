import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Flower2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Redirect if already logged in
  if (user) {
    navigate('/members', { replace: true })
    return null
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase!.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      navigate('/members')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address first')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      setResetSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-navy font-heading text-3xl font-bold">
            <Flower2 className="h-8 w-8 text-terracotta" />
            Rebloom SA
          </Link>
          <p className="text-navy/60 mt-2 font-body">Sign in to the member area</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-warm-cream-dark p-8">
          {resetSent ? (
            <div className="text-center py-4">
              <p className="text-hope-green font-medium mb-2">Password reset email sent!</p>
              <p className="text-navy/60 text-sm">Check your inbox for a reset link.</p>
              <button
                onClick={() => setResetSent(false)}
                className="text-terracotta text-sm mt-4 hover:underline cursor-pointer"
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-center text-sm text-terracotta hover:underline cursor-pointer"
              >
                Forgot your password?
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-navy/50">
          <Link to="/" className="text-terracotta hover:underline">&larr; Back to Rebloom SA</Link>
        </p>
      </div>
    </div>
  )
}
