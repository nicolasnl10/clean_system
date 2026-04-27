'use client'

import { useRouter } from 'next/navigation'
import { ClientForm, type ClientFormData } from '@/components/clients/client-form'
import { useCreateClient } from '@/hooks/useClients'

export default function NewClientPage() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateClient()

  async function handleSubmit(data: ClientFormData) {
    const client = await mutateAsync(data)
    router.push(`/dashboard/clients/${client.id}`)
  }

  return <ClientForm title="Novo Cliente" onSubmit={handleSubmit} isLoading={isPending} />
}
