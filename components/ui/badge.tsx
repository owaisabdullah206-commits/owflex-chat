import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--of-primary)] text-white',
        secondary:
          'border-transparent bg-[var(--surface-2)] text-[var(--ink-muted)]',
        success:
          'border-transparent bg-[var(--of-success-soft)] text-[var(--of-success)]',
        warning:
          'border-transparent bg-[var(--of-warning-soft)] text-[var(--of-warning)]',
        destructive:
          'border-transparent bg-[var(--of-error-soft)] text-[var(--of-error)]',
        outline:
          'border-[var(--hairline)] text-[var(--ink-muted)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
