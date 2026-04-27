'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ClientForm, type ClientFormData } from '@/components/clients/client-form'
import { useClient, useUpdateClient } from '@/hooks/useClients'

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: client, isLoading } = useClient(id)
  const { mutateAsync, isPending } = useUpdateClient(id)

  async function handleSubmit(data: ClientFormData) {
    await mutateAsync(data)
    router.push(`/dashboard/clients/${id}`)
  }

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (!client) return <p className="text-destructive">Cliente nao encontrado.</p>

  return (
    <ClientForm
      title="Editar Cliente"
      defaultValues={client}
      onSubmit={handleSubmit}
      isLoading={isPending}
    />
  )
}
