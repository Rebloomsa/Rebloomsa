import { ClipboardList, UserCheck, Mail, Users } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const steps = [
  {
    icon: ClipboardList,
    num: '01',
    title: 'Join the Waitlist',
    description: 'Share your story and apply for membership. Tell us a little about yourself and what you\'re looking for.',
  },
  {
    icon: UserCheck,
    num: '02',
    title: 'Get Personally Approved',
    description: 'Your profile is personally reviewed by our founder, Darryl, to ensure a safe and genuine community.',
  },
  {
    icon: Mail,
    num: '03',
    title: 'Receive Your Invite',
    description: 'Once approved, you\'ll receive an email invitation to set up your password and access the member area.',
  },
  {
    icon: Users,
    num: '04',
    title: 'Browse & Connect',
    description: 'Explore verified member profiles, filter by province, and connect with people who truly understand your journey.',
  },
]

export default function CommunicationFlow() {
  const fadeIn = useFadeIn()

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8 bg-white" ref={fadeIn.ref}>
      <div className={`max-w-5xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-5">
          Your Journey to Connection
        </h2>
        <p className="text-center text-navy/60 mb-16 max-w-lg mx-auto leading-relaxed">
          From sign-up to community — here's how you'll connect with fellow members
        </p>

        <div className="max-w-2xl mx-auto space-y-0">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex gap-6 pb-12 last:pb-0">
              {/* Timeline line */}
              {i < steps.length - 1 && (
                <div className="absolute left-7 top-16 bottom-0 w-px bg-bloom-pink/40" />
              )}

              {/* Icon */}
              <div className="relative z-10 shrink-0">
                <div className="w-14 h-14 rounded-full bg-bloom-pink/20 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-terracotta" />
                </div>
              </div>

              {/* Content */}
              <div className="pt-1">
                <span className="text-terracotta font-bold text-xs tracking-wider">{s.num}</span>
                <h3 className="font-heading text-xl font-semibold text-navy mt-1 mb-2">{s.title}</h3>
                <p className="text-navy/60 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
