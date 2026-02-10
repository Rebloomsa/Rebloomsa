import { useNavigate } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'

interface MemberCardProps {
  member: {
    id: string
    name: string
    province: string
    age_range: string
    bio: string | null
  }
}

export default function MemberCard({ member }: MemberCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/members/profile/${member.id}`)}
      className="bg-white rounded-xl shadow-sm border border-warm-cream-dark p-6 text-left hover:shadow-md hover:border-terracotta/30 transition-all cursor-pointer w-full"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-bloom-pink/30 flex items-center justify-center shrink-0">
          <span className="text-lg font-heading font-bold text-terracotta">
            {member.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold text-navy truncate">{member.name}</h3>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-navy/60">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {member.province}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {member.age_range}
            </span>
          </div>
          {member.bio && (
            <p className="mt-2 text-sm text-navy/50 line-clamp-2">{member.bio}</p>
          )}
        </div>
      </div>
    </button>
  )
}
