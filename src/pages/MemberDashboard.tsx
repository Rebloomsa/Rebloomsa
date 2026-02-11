import { useState, useEffect } from 'react'
import { Search, MapPin, Eye, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MemberCard from '@/components/MemberCard'
import MemberNav from '@/components/MemberNav'
import WelcomeScreen from '@/components/WelcomeScreen'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface Member {
  id: string
  name: string
  province: string
  age_range: string
  bio: string | null
}

interface ProfileViewer {
  viewer_id: string
  viewed_at: string
  viewer_name: string
  viewer_province: string
}

export default function MemberDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [provinceFilter, setProvinceFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [myProvince, setMyProvince] = useState('')
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem('rebloom_welcomed')
  )
  const [viewCount, setViewCount] = useState(0)
  const [viewers, setViewers] = useState<ProfileViewer[]>([])
  const [showViewers, setShowViewers] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('members')
      .select('province')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.province) setMyProvince(data.province)
      })
  }, [user])

  // Fetch profile views for the past week
  useEffect(() => {
    if (!supabase || !user) return
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('profile_views')
      .select('viewer_id, viewed_at')
      .eq('viewed_id', user.id)
      .gte('viewed_at', oneWeekAgo)
      .order('viewed_at', { ascending: false })
      .then(async ({ data: views }) => {
        if (!views || views.length === 0) { setViewCount(0); return }
        setViewCount(views.length)
        // Fetch viewer details
        const viewerIds = [...new Set(views.map((v: any) => v.viewer_id))]
        const { data: viewerMembers } = await supabase
          .from('members')
          .select('id, name, province')
          .in('id', viewerIds)
        const memberMap = new Map((viewerMembers || []).map((m: any) => [m.id, m]))
        setViewers(
          views.map((v: any) => {
            const m = memberMap.get(v.viewer_id)
            return {
              viewer_id: v.viewer_id,
              viewed_at: v.viewed_at,
              viewer_name: m?.name || 'Unknown',
              viewer_province: m?.province || '',
            }
          })
        )
      })
  }, [user])

  useEffect(() => {
    async function fetchMembers() {
      if (!supabase) return
      const { data, error } = await supabase
        .from('members')
        .select('id, name, province, age_range, bio')
        .order('created_at', { ascending: false })
      if (!error && data) setMembers(data)
      setLoading(false)
    }
    fetchMembers()
  }, [])

  const nearbyMembers = myProvince && user
    ? members.filter((m) => m.province === myProvince && m.id !== user.id).slice(0, 3)
    : []

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

  const filtered = members.filter((m) => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase())
    const matchesProvince = !provinceFilter || m.province === provinceFilter
    return matchesSearch && matchesProvince
  })

  if (showWelcome) {
    return (
      <WelcomeScreen
        onDismiss={() => {
          localStorage.setItem('rebloom_welcomed', '1')
          setShowWelcome(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <MemberNav />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-2">
            Member Directory
          </h1>
          <p className="text-navy/60">Connect with fellow Rebloom members across South Africa</p>
        </div>

        {/* Profile views card */}
        {viewCount > 0 && !search && !provinceFilter && (
          <div className="mb-8">
            <div
              className="bg-white rounded-xl border border-warm-cream-dark p-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setShowViewers(!showViewers)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-terracotta" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">
                    {viewCount} {viewCount === 1 ? 'person' : 'people'} viewed your profile this week
                  </p>
                  <p className="text-xs text-navy/50">Click to {showViewers ? 'hide' : 'see who'}</p>
                </div>
              </div>
            </div>
            {showViewers && (
              <div className="mt-2 bg-white rounded-xl border border-warm-cream-dark divide-y divide-warm-cream-dark">
                {viewers.map((v, i) => (
                  <div key={`${v.viewer_id}-${i}`} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-terracotta">
                          {v.viewer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">{v.viewer_name}</p>
                        {v.viewer_province && (
                          <p className="text-xs text-navy/50">{v.viewer_province}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-navy/40">
                      {new Date(v.viewed_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members near you */}
        {nearbyMembers.length > 0 && !search && !provinceFilter && (
          <div className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-navy mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-terracotta" />
              Members near you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {nearbyMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-warm-cream-dark bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          >
            <option value="">All Provinces</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12 text-navy/50">Loading members...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-navy/50">
            {search || provinceFilter ? 'No members match your search' : 'No members yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
