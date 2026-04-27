'use client'

import { use } from 'react'
import Link from 'next/link'
import { useClient } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Pencil, MapPin, Phone, Mail, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_LABEL: Record<string, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_execucao: 'Em execucao',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
  reagendado: 'Reagendado',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  agendado: 'outline',
  confirmado: 'secondary',
  em_execucao: 'default',
  concluido: 'default',
  cancelado: 'destructive',
  reagendado: 'outline',
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: client, isLoading } = useClient(id)

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (!client) return <p className="text-destructive">Cliente nao encontrado.</p>

  const address = [
    client.addressStreet,
    client.addressNumber,
    client.addressComplement,
    client.neighborhood,
    client.city && client.state ? `${client.city}/${client.state}` : client.city,
    client.zipCode,
  ].filter(Boolean).join(', ')

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <Badge variant={client.customerType === 'comercial' ? 'default' : 'secondary'} className="mt-1">
              {client.customerType === 'comercial' ? 'Comercial' : 'Residencial'}
            </Badge>
          </div>
        </div>
        <Link href={`/dashboard/clients/${id}/edit`}>
          <Button variant="outline"><Pencil size={14} className="mr-2" />Editar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-muted-foreground shrink-0" />
                <span>{client.email}</span>
              </div>
            )}
            {client.document && (
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-muted-foreground shrink-0" />
                <span>{client.document}</span>
              </div>
            )}
            {!client.phone && !client.email && !client.document && (
              <p className="text-sm text-muted-foreground">Sem informacoes de contato.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Endereco</CardTitle></CardHeader>
          <CardContent>
            {address ? (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Endereco nao informado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Observacoes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            <Calendar size={15} className="inline mr-2 text-muted-foreground" />
            Historico de Agendamentos
          </CardTitle>
          <Link href={`/dashboard/appointments?clientId=${id}`}>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {!client.appointments || client.appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum agendamento encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {client.appointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{apt.service?.name}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(apt.scheduledDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[apt.status] ?? 'outline'}>
                    {STATUS_LABEL[apt.status] ?? apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
