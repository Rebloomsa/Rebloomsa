import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MemberNav from '@/components/MemberNav'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const provinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
]

const ageRanges = [
  '30–39',
  '40–49',
  '50–59',
  '60–69',
  '70+',
]

export default function EditProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [province, setProvince] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('members')
      .select('name, province, age_range, bio')
      .eq('id', user.id)
      .single()
      .then(({ data, error: fetchErr }) => {
        if (fetchErr || !data) {
          setError('Could not load your profile')
        } else {
          setName(data.name)
          setProvince(data.province)
          setAgeRange(data.age_range)
          setBio(data.bio || '')
        }
        setLoading(false)
      })
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !user) return
    setError('')
    setSaving(true)

    const { error: updateErr } = await supabase
      .from('members')
      .update({
        name: name.trim(),
        province,
        age_range: ageRange,
        bio: bio.trim() || null,
      })
      .eq('id', user.id)

    if (updateErr) {
      setError(updateErr.message || 'Failed to save changes')
    } else {
      setSuccess(true)
      setTimeout(() => navigate(`/members/profile/${user.id}`), 1500)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <MemberNav />
      <main className="max-w-xl mx-auto px-6 sm:px-8 pt-24 pb-12">
        <Link
          to={user ? `/members/profile/${user.id}` : '/members'}
          className="inline-flex items-center gap-1 text-sm text-terracotta hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>

        <h1 className="font-heading text-3xl font-bold text-navy mb-8">Edit Profile</h1>

        {loading ? (
          <p className="text-navy/50">Loading your profile...</p>
        ) : success ? (
          <div className="bg-white rounded-xl border border-warm-cream-dark p-8 text-center">
            <p className="text-hope-green font-medium mb-2">Profile updated!</p>
            <p className="text-navy/60 text-sm">Redirecting to your profile...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-warm-cream-dark p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-warm-cream-dark bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  required
                >
                  <option value="">Select province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Age range</label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-warm-cream-dark bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  required
                >
                  <option value="">Select age range</option>
                  {ageRanges.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">About you</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Share a bit about yourself, your journey, and what brings you to Rebloom..."
                  className="w-full px-4 py-2.5 rounded-lg border border-warm-cream-dark bg-warm-cream text-sm text-navy placeholder:text-navy/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-none transition-colors"
                />
                <p className="text-xs text-navy/40 mt-1">{bio.length}/1000 characters</p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/members/profile/${user?.id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
