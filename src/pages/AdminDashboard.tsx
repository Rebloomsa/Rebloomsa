import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, LogOut, Check, X, Download, Clock, CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'

interface WaitlistEntry {
  id: number
  name: string
  email: string
  province: string
  age_range: string
  story: string | null
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [digestSending, setDigestSending] = useState(false)
  const [digestResult, setDigestResult] = useState<string | null>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/waitlist`, {
        headers: { 'Authorization': `Bearer ${user?.id}` },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setEntries(data)
    } catch (err) {
      console.error('Failed to fetch waitlist:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function handleApprove(entry: WaitlistEntry) {
    setActionLoading(entry.id)
    try {
      const res = await fetch(`${apiUrl}/api/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.id}` },
        body: JSON.stringify({ waitlistId: entry.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Approval failed')
      }
      await fetchEntries()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(entry: WaitlistEntry) {
    setActionLoading(entry.id)
    try {
      const res = await fetch(`${apiUrl}/api/admin/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.id}` },
        body: JSON.stringify({ waitlistId: entry.id }),
      })
      if (!res.ok) throw new Error('Rejection failed')
      await fetchEntries()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleExportCSV() {
    try {
      const res = await fetch(`${apiUrl}/api/admin/export`, {
        headers: { 'Authorization': `Bearer ${user?.id}` },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rebloom-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleSendDigest() {
    if (!confirm('Send the weekly email digest to all eligible members?')) return
    setDigestSending(true)
    setDigestResult(null)
    try {
      const res = await fetch(`${apiUrl}/api/admin/send-weekly-digest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.id}` },
      })
      if (!res.ok) throw new Error('Failed to send digest')
      const data = await res.json()
      setDigestResult(`Digest sent to ${data.sent} of ${data.total} members`)
    } catch (err: any) {
      setDigestResult(`Error: ${err.message}`)
    } finally {
      setDigestSending(false)
    }
  }

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  const filtered = entries.filter((e) => e.status === tab)
  const counts = {
    pending: entries.filter((e) => e.status === 'pending').length,
    approved: entries.filter((e) => e.status === 'approved').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-cream/90 backdrop-blur-md border-b border-warm-cream-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 text-navy font-heading text-2xl font-bold">
            <Flower2 className="h-7 w-7 text-terracotta" />
            Rebloom Admin
          </a>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSendDigest} disabled={digestSending}>
              {digestSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              {digestSending ? 'Sending...' : 'Send Digest'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 pt-24 pb-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-2">
          Waitlist Management
        </h1>
        <p className="text-navy/60 mb-8">Review and approve member applications</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-warm-cream-dark p-4 text-center">
            <Clock className="h-5 w-5 text-terracotta mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{counts.pending}</p>
            <p className="text-xs text-navy/50">Pending</p>
          </div>
          <div className="bg-white rounded-lg border border-warm-cream-dark p-4 text-center">
            <CheckCircle className="h-5 w-5 text-hope-green mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{counts.approved}</p>
            <p className="text-xs text-navy/50">Approved</p>
          </div>
          <div className="bg-white rounded-lg border border-warm-cream-dark p-4 text-center">
            <XCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{counts.rejected}</p>
            <p className="text-xs text-navy/50">Rejected</p>
          </div>
        </div>

        {/* Digest result */}
        {digestResult && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${digestResult.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-hope-green/10 text-hope-green'}`}>
            {digestResult}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-warm-cream-dark rounded-lg p-1 w-fit">
          {(['pending', 'approved', 'rejected'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                tab === t
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-navy/50 hover:text-navy'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-navy/50">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-navy/50">No {tab} entries</div>
        ) : (
          <div className="bg-white rounded-xl border border-warm-cream-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-cream-dark bg-warm-cream/50">
                    <th className="text-left px-4 py-3 font-medium text-navy/70">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-navy/70">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-navy/70">Province</th>
                    <th className="text-left px-4 py-3 font-medium text-navy/70">Age</th>
                    <th className="text-left px-4 py-3 font-medium text-navy/70">Story</th>
                    <th className="text-left px-4 py-3 font-medium text-navy/70">Date</th>
                    {tab === 'pending' && (
                      <th className="text-right px-4 py-3 font-medium text-navy/70">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="border-b border-warm-cream-dark last:border-0">
                      <td className="px-4 py-3 font-medium text-navy">{entry.name}</td>
                      <td className="px-4 py-3 text-navy/70">{entry.email}</td>
                      <td className="px-4 py-3 text-navy/70">{entry.province}</td>
                      <td className="px-4 py-3 text-navy/70">{entry.age_range}</td>
                      <td className="px-4 py-3 text-navy/70 max-w-[200px] truncate">
                        {entry.story || '—'}
                      </td>
                      <td className="px-4 py-3 text-navy/50 text-xs whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleDateString('en-ZA')}
                      </td>
                      {tab === 'pending' && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(entry)}
                              disabled={actionLoading === entry.id}
                              className="bg-hope-green hover:bg-hope-green-light text-white"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(entry)}
                              disabled={actionLoading === entry.id}
                              className="border-red-300 text-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
