import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl bg-white shadow-md border border-warm-cream-dark p-6',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }
