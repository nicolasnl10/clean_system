import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { AppointmentsService } from './appointments.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { QueryAppointmentDto } from './dto/query-appointment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Roles('admin', 'atendimento')
  @Post()
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentsService.create(dto, user.id)
  }

  @Roles('admin', 'atendimento', 'supervisor')
  @Get()
  findAll(@Query() query: QueryAppointmentDto) {
    return this.appointmentsService.findAll(query)
  }

  @Roles('admin', 'atendimento', 'supervisor')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id)
  }

  @Roles('admin', 'atendimento')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto)
  }

  @Roles('admin', 'atendimento', 'supervisor')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.appointmentsService.updateStatus(id, dto)
  }

  @Roles('admin', 'atendimento')
  @Post(':id/generate-recurring')
  generateRecurring(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointmentsService.generateRecurring(id, user.id)
  }
}
