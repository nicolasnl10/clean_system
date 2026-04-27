import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export type CustomerType = 'residencial' | 'comercial'

export interface Client {
  id: string
  name: string
  customerType: CustomerType
  document?: string
  email?: string
  phone?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
  appointments?: any[]
}

export interface ClientFilters {
  search?: string
  customerType?: CustomerType
}

export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      const { data } = await api.get<Client[]>('/clients', { params: filters })
      return data
    },
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data } = await api.get<Client>(`/clients/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Client>) => api.post('/clients', body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente cadastrado com sucesso.')
    },
    onError: () => toast.error('Erro ao cadastrar cliente.'),
  })
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Client>) => api.patch(`/clients/${id}`, body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente atualizado com sucesso.')
    },
    onError: () => toast.error('Erro ao atualizar cliente.'),
  })
}
