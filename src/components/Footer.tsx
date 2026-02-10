import { Flower2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/70 py-16 sm:py-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-heading text-xl font-bold mb-3">
              <Flower2 className="h-6 w-6 text-terracotta" />
              Rebloom SA
            </div>
            <p className="text-sm leading-relaxed">
              South Africa's compassionate community for widows and widowers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="hover:text-bloom-pink transition-colors">How It Works</a></li>
              <li><a href="#comparison" className="hover:text-bloom-pink transition-colors">Why Rebloom</a></li>
              <li><a href="#founder-story" className="hover:text-bloom-pink transition-colors">Our Story</a></li>
              <li><a href="#faq" className="hover:text-bloom-pink transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-bloom-pink transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-bloom-pink transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-bloom-pink transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@rebloomsa.co.za" className="hover:text-bloom-pink transition-colors">hello@rebloomsa.co.za</a></li>
              <li><a href="https://facebook.com/RebloomSA" target="_blank" rel="noopener noreferrer" className="hover:text-bloom-pink transition-colors">Facebook</a></li>
              <li><a href="https://instagram.com/rebloomza" target="_blank" rel="noopener noreferrer" className="hover:text-bloom-pink transition-colors">Instagram</a></li>
              <li><a href="https://x.com/RebloomSA" target="_blank" rel="noopener noreferrer" className="hover:text-bloom-pink transition-colors">X (Twitter)</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Rebloom SA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
