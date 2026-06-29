'use client'

import { useState } from 'react'
import { NewBotForm } from '@/components/dashboard/NewBotForm'
import { BotPreview } from '@/components/dashboard/BotPreview'

// Holds the bot-name state so the live preview updates as the user types in the form.
// The new-bot page is a server component, so this shared state lives here on the client.
export function NewBotWorkspace({ toolsBase }: { toolsBase: string }) {
  const [name, setName] = useState('')
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
      <div>
        <NewBotForm toolsBase={toolsBase} onNameChange={setName} />
      </div>
      <div>
        <BotPreview botName={name} />
      </div>
    </div>
  )
}
