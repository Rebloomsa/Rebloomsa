import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pink' | 'green'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        {
          'bg-terracotta/10 text-terracotta': variant === 'default',
          'bg-bloom-pink/30 text-navy': variant === 'pink',
          'bg-hope-green/20 text-navy': variant === 'green',
        },
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }
