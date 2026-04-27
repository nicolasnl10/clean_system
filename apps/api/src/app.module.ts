import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ClientsModule } from './clients/clients.module'
import { EmployeesModule } from './employees/employees.module'
import { TeamsModule } from './teams/teams.module'
import { AppointmentsModule } from './appointments/appointments.module'
import { ServicesModule } from './services/services.module'
import { ServiceOrdersModule } from './service-orders/service-orders.module'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    EmployeesModule,
    TeamsModule,
    AppointmentsModule,
    ServicesModule,
    ServiceOrdersModule,
  ],
})
export class AppModule {}
