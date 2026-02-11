import { Link } from 'react-router-dom'
import { Flower2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Flower2 className="h-16 w-16 text-terracotta mx-auto mb-6 opacity-40" />
        <h1 className="font-heading text-4xl font-bold text-navy mb-3">Page not found</h1>
        <p className="text-navy/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link to="/members">
            <Button>Member Directory</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
