'use client'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

type ToasterPropsCustom = ToasterProps

const Toaster = ({ ...props }: ToasterPropsCustom) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] shadow-lg rounded-lg',
          description: 'text-[var(--ink-muted)]',
          actionButton: 'bg-[var(--of-primary)] text-white',
          cancelButton: 'bg-[var(--surface-2)] text-[var(--ink-muted)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
