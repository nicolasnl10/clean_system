'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Search, User } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [customerType, setCustomerType] = useState<'residencial' | 'comercial' | ''>('')

  const { data: clients, isLoading } = useClients({
    search: search || undefined,
    customerType: customerType || undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients?.length ?? 0} cliente(s) cadastrado(s)
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button><Plus size={16} className="mr-2" />Novo Cliente</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, telefone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value as any)}
        >
          <option value="">Todos os tipos</option>
          <option value="residencial">Residencial</option>
          <option value="comercial">Comercial</option>
        </select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && clients?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {clients?.map((client) => (
              <TableRow key={client.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <Badge variant={client.customerType === 'comercial' ? 'default' : 'secondary'}>
                    {TYPE_LABEL[client.customerType]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.phone ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{client.email ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {client.city ? `${client.city}/${client.state}` : '—'}
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Button variant="ghost" size="sm">
                      <User size={14} className="mr-1" />Ver
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
