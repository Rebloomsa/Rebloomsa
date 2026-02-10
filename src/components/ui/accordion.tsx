import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  title: string
  children: ReactNode
}

export function AccordionItem({ title, children }: AccordionItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-warm-cream-dark">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-6 text-left font-heading text-lg font-semibold text-navy hover:text-terracotta transition-colors cursor-pointer"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn(
            'h-5 w-5 text-terracotta transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-96 pb-6' : 'max-h-0'
        )}
      >
        <div className="text-navy/70 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
