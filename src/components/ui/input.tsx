import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-warm-cream-dark bg-white px-4 py-3 text-navy placeholder:text-navy/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-colors',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
