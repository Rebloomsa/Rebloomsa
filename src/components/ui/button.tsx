import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta cursor-pointer',
          {
            'bg-terracotta text-white hover:bg-terracotta-light shadow-md hover:shadow-lg': variant === 'primary',
            'bg-navy text-white hover:bg-navy-light shadow-md hover:shadow-lg': variant === 'secondary',
            'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white': variant === 'outline',
            'text-navy hover:text-terracotta hover:bg-warm-cream-dark': variant === 'ghost',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
