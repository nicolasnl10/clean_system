import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { QueryAppointmentDto } from './dto/query-appointment.dto'

const APPOINTMENT_INCLUDE = {
  client: { select: { id: true, name: true, phone: true, customerType: true } },
  service: { select: { id: true, name: true, estimatedDurationMinutes: true, basePrice: true } },
  team: {
    include: {
      supervisor: { select: { id: true, name: true } },
      members: { include: { employee: { select: { id: true, name: true } } } },
    },
  },
  createdBy: { select: { id: true, name: true } },
  serviceOrder: { select: { id: true, status: true } },
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private toTimeDate(hhmm: string): Date {
    return new Date(`1970-01-01T${hhmm}:00.000Z`)
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
  }

  private async checkTeamConflict(
    teamId: string,
    scheduledDate: Date,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    const existing = await this.prisma.appointment.findMany({
      where: {
        teamId,
        scheduledDate,
        status: { notIn: ['cancelado', 'reagendado'] },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    })

    const newStart = startTime.getTime()
    const newEnd = endTime.getTime()

    const conflict = existing.find((a) => {
      const exStart = new Date(a.startTime).getTime()
      const exEnd = new Date(a.endTime).getTime()
      return exStart < newEnd && exEnd > newStart
    })

    if (conflict) {
      throw new ConflictException(
        `Equipe já possui agendamento neste horário (${new Date(conflict.startTime).toISOString().slice(11, 16)} - ${new Date(conflict.endTime).toISOString().slice(11, 16)})`,
      )
    }
  }

  async create(dto: CreateAppointmentDto, userId: string) {
    const [client, service, team] = await Promise.all([
      this.prisma.client.findUnique({ where: { id: dto.clientId } }),
      this.prisma.service.findUnique({ where: { id: dto.serviceId } }),
      this.prisma.team.findUnique({ where: { id: dto.teamId } }),
    ])
    if (!client) throw new NotFoundException('Cliente não encontrado')
    if (!service) throw new NotFoundException('Serviço não encontrado')
    if (!team) throw new NotFoundException('Equipe não encontrada')

    const scheduledDate = new Date(dto.scheduledDate)
    const startTime = this.toTimeDate(dto.startTime)
    const endTime = this.toTimeDate(dto.endTime)

    if (endTime <= startTime) {
      throw new BadRequestException('endTime deve ser posterior ao startTime')
    }

    await this.checkTeamConflict(dto.teamId, scheduledDate, startTime, endTime)

    return this.prisma.appointment.create({
      data: {
        clientId: dto.clientId,
        serviceId: dto.serviceId,
        teamId: dto.teamId,
        scheduledDate,
        startTime,
        endTime,
        frequency: dto.frequency ?? 'unico',
        notes: dto.notes,
        createdById: userId,
      },
      include: APPOINTMENT_INCLUDE,
    })
  }

  findAll(query: QueryAppointmentDto) {
    const { date, startDate, endDate, teamId, clientId, status } = query

    return this.prisma.appointment.findMany({
      where: {
        ...(teamId && { teamId }),
        ...(clientId && { clientId }),
        ...(status && { status }),
        ...(date && { scheduledDate: new Date(date) }),
        ...(startDate &&
          endDate && {
            scheduledDate: { gte: new Date(startDate), lte: new Date(endDate) },
          }),
      },
      include: APPOINTMENT_INCLUDE,
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
    })
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        ...APPOINTMENT_INCLUDE,
        parentAppointment: { select: { id: true, scheduledDate: true } },
        childAppointments: { select: { id: true, scheduledDate: true, status: true } },
      },
    })
    if (!appointment) throw new NotFoundException('Agendamento não encontrado')
    return appointment
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const current = await this.findOne(id)

    if (['concluido', 'cancelado'].includes(current.status)) {
      throw new BadRequestException('Agendamento concluído ou cancelado não pode ser alterado')
    }

    const scheduledDate = dto.scheduledDate ? new Date(dto.scheduledDate) : current.scheduledDate
    const startTime = dto.startTime ? this.toTimeDate(dto.startTime) : new Date(current.startTime)
    const endTime = dto.endTime ? this.toTimeDate(dto.endTime) : new Date(current.endTime)
    const teamId = dto.teamId ?? current.teamId

    if (endTime <= startTime) {
      throw new BadRequestException('endTime deve ser posterior ao startTime')
    }

    if (dto.teamId || dto.scheduledDate || dto.startTime || dto.endTime) {
      await this.checkTeamConflict(teamId, scheduledDate, startTime, endTime, id)
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.serviceId && { serviceId: dto.serviceId }),
        ...(dto.teamId && { teamId: dto.teamId }),
        ...(dto.scheduledDate && { scheduledDate }),
        ...(dto.startTime && { startTime }),
        ...(dto.endTime && { endTime }),
        ...(dto.frequency && { frequency: dto.frequency }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: APPOINTMENT_INCLUDE,
    })
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findOne(id)
    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
      include: APPOINTMENT_INCLUDE,
    })
  }

  async generateRecurring(id: string, userId: string) {
    const parent = await this.findOne(id)

    if (parent.frequency === 'unico') {
      throw new BadRequestException('Agendamento não é recorrente')
    }

    const intervals: Record<string, number> = { semanal: 7, quinzenal: 14 }
    const occurrences = { semanal: 12, quinzenal: 6, mensal: 3 }
    const count = occurrences[parent.frequency] ?? 3

    const existingChildren = await this.prisma.appointment.count({
      where: { parentAppointmentId: id },
    })
    if (existingChildren > 0) {
      throw new ConflictException('Recorrências já foram geradas para este agendamento')
    }

    const created: any[] = []
    let baseDate = new Date(parent.scheduledDate)

    for (let i = 1; i <= count; i++) {
      const nextDate =
        parent.frequency === 'mensal'
          ? this.addMonths(baseDate, 1)
          : this.addDays(baseDate, intervals[parent.frequency])

      baseDate = nextDate

      const appointment = await this.prisma.appointment.create({
        data: {
          clientId: parent.clientId,
          serviceId: parent.serviceId,
          teamId: parent.teamId,
          scheduledDate: nextDate,
          startTime: new Date(parent.startTime),
          endTime: new Date(parent.endTime),
          frequency: parent.frequency,
          notes: parent.notes,
          createdById: userId,
          parentAppointmentId: id,
        },
      })
      created.push(appointment)
    }

    return { generated: created.length, appointments: created }
  }
}
