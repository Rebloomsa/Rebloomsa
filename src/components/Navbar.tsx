import { useState } from 'react'
import { Menu, X, Flower2, LogIn } from 'lucide-react'
import { Button } from './ui/button'

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Rebloom', href: '#comparison' },
  { label: 'Our Story', href: '#founder-story' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-cream/90 backdrop-blur-md border-b border-warm-cream-dark">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 w-full flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 text-navy font-heading text-2xl font-bold">
          <Flower2 className="h-7 w-7 text-terracotta" />
          Rebloom SA
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-navy/70 hover:text-terracotta transition-colors text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
          <Button size="sm" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
            Join Waitlist
          </Button>
        </div>

        {/* Login + Mobile toggle */}
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-terracotta transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Member</span> Login
          </a>
          <button
            className="md:hidden text-navy cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-warm-cream border-b border-warm-cream-dark max-w-5xl mx-auto px-6 sm:px-8 w-full pb-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 text-navy/70 hover:text-terracotta transition-colors font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Button
            className="w-full mt-2"
            size="sm"
            onClick={() => {
              setMobileOpen(false)
              document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Join Waitlist
          </Button>
        </div>
      )}
    </nav>
  )
}
