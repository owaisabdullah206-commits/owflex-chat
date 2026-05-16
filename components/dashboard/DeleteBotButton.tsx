'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteBot } from '@/lib/db/queries/bots'

interface DeleteBotButtonProps {
  botId: string
  botName: string
}

export function DeleteBotButton({ botId, botName }: DeleteBotButtonProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const canDelete = confirmText.trim() === botName

  function handleDelete() {
    if (!canDelete) return
    startTransition(async () => {
      const result = await deleteBot(botId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Bot "${botName}" deleted`)
      setOpen(false)
      router.push('/dashboard/bots')
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[var(--ink-muted)] hover:text-red-500 hover:bg-red-500/5"
          title="Delete bot"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-500">Delete this bot?</DialogTitle>
          <DialogDescription className="text-[var(--ink-muted)]">
            This permanently deletes <strong className="text-[var(--ink)]">{botName}</strong> and
            all of its conversations, messages, leads, FAQs, and pending invites. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-bot-name" className="text-sm font-medium text-[var(--ink)]">
            Type the bot name to confirm
          </Label>
          <Input
            id="confirm-bot-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={botName}
            autoComplete="off"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false)
              setConfirmText('')
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!canDelete || isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? 'Deleting…' : 'Delete bot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
