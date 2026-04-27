'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, ClipboardList, TrendingUp } from 'lucide-react'

const KPI_CARDS = [
  { title: 'Clientes Ativos', value: '—', icon: Users, color: 'text-blue-600' },
  { title: 'Agendamentos Hoje', value: '—', icon: Calendar, color: 'text-green-600' },
  { title: 'Serviços Concluídos', value: '—', icon: ClipboardList, color: 'text-purple-600' },
  { title: 'Faturamento do Mês', value: '—', icon: TrendingUp, color: 'text-orange-600' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Bem-vindo ao painel de controle.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon size={18} className={color} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
