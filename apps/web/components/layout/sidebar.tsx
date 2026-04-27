'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  UserCog,
  UsersRound,
  Wrench,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/appointments', label: 'Agendamentos', icon: Calendar },
  { href: '/dashboard/service-orders', label: 'Ordens de Serviço', icon: ClipboardList },
  { href: '/dashboard/employees', label: 'Funcionários', icon: UserCog },
  { href: '/dashboard/teams', label: 'Equipes', icon: UsersRound },
  { href: '/dashboard/services', label: 'Serviços', icon: Wrench },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 flex flex-col bg-card border-r h-full shrink-0">
      <div className="p-5 flex items-center gap-3 border-b">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-sm font-bold">CS</span>
        </div>
        <span className="font-semibold text-sm">Clean System</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Separator />
      <div className="p-3 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-muted">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Sair">
          <LogOut size={16} />
        </Button>
      </div>
    </aside>
  )
}
