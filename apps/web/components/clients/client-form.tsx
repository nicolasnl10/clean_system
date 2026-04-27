'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client } from '@/hooks/useClients'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatorio'),
  customerType: z.enum(['residencial', 'comercial']),
  document: z.string().optional(),
  email: z.string().email('E-mail invalido').optional().or(z.literal('')),
  phone: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
})

export type ClientFormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => Promise<void>
  isLoading: boolean
  title: string
}

export function ClientForm({ defaultValues, onSubmit, isLoading, title }: Props) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerType: 'residencial', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados principais</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Nome *</Label>
            <Input placeholder="Nome completo ou razao social" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              {...register('customerType')}
            >
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>CPF / CNPJ</Label>
            <Input placeholder="000.000.000-00" {...register('document')} />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" placeholder="email@exemplo.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input placeholder="(11) 99999-0000" {...register('phone')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Endereco</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Rua / Avenida</Label>
            <Input placeholder="Rua das Flores" {...register('addressStreet')} />
          </div>
          <div className="space-y-1.5">
            <Label>Numero</Label>
            <Input placeholder="123" {...register('addressNumber')} />
          </div>
          <div className="space-y-1.5">
            <Label>Complemento</Label>
            <Input placeholder="Apto 42" {...register('addressComplement')} />
          </div>
          <div className="space-y-1.5">
            <Label>Bairro</Label>
            <Input {...register('neighborhood')} />
          </div>
          <div className="space-y-1.5">
            <Label>CEP</Label>
            <Input placeholder="00000-000" {...register('zipCode')} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Cidade</Label>
            <Input {...register('city')} />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Input placeholder="SP" maxLength={2} {...register('state')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Observacoes</CardTitle></CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Informacoes adicionais sobre o cliente..."
            {...register('notes')}
          />
        </CardContent>
      </Card>
    </form>
  )
}
