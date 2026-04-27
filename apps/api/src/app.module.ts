import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ClientsModule } from './clients/clients.module'
import { EmployeesModule } from './employees/employees.module'
import { TeamsModule } from './teams/teams.module'
import { AppointmentsModule } from './appointments/appointments.module'

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ClientsModule, EmployeesModule, TeamsModule, AppointmentsModule],
})
export class AppModule {}
