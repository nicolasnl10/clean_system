import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { PrismaService } from '../prisma/prisma.service'
import { CreateServiceOrderDto } from './dto/create-service-order.dto'
import { UpdateChecklistDto } from './dto/update-checklist.dto'
import { FinishServiceOrderDto } from './dto/finish-service-order.dto'

const SO_INCLUDE = {
  appointment: {
    include: {
      client: { select: { id: true, name: true, phone: true } },
      service: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
  },
  checklists: { orderBy: { id: 'asc' as const } },
}

@Injectable()
export class ServiceOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceOrderDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { service: { include: { checklistTemplates: { where: { active: true }, orderBy: { orderIndex: 'asc' } } } } },
    })
    if (!appointment) throw new NotFoundException('Agendamento não encontrado')

    const existing = await this.prisma.serviceOrder.findUnique({
      where: { appointmentId: dto.appointmentId },
    })
    if (existing) throw new ConflictException('Já existe uma ordem de serviço para este agendamento')

    const serviceOrder = await this.prisma.serviceOrder.create({
      data: {
        appointmentId: dto.appointmentId,
        checklists: {
          create: appointment.service.checklistTemplates.map((t) => ({
            templateItemId: t.id,
            itemName: t.itemName,
            completed: false,
          })),
        },
      },
      include: SO_INCLUDE,
    })

    await this.prisma.appointment.update({
      where: { id: dto.appointmentId },
      data: { status: 'confirmado' },
    })

    return serviceOrder
  }

  findAll(appointmentId?: string) {
    return this.prisma.serviceOrder.findMany({
      where: { ...(appointmentId && { appointmentId }) },
      include: SO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const so = await this.prisma.serviceOrder.findUnique({ where: { id }, include: SO_INCLUDE })
    if (!so) throw new NotFoundException('Ordem de serviço não encontrada')
    return so
  }

  async start(id: string) {
    const so = await this.findOne(id)
    if (so.status !== 'aberta') {
      throw new BadRequestException('Somente ordens abertas podem ser iniciadas')
    }

    const [updated] = await Promise.all([
      this.prisma.serviceOrder.update({
        where: { id },
        data: { status: 'em_execucao', startedAt: new Date() },
        include: SO_INCLUDE,
      }),
      this.prisma.appointment.update({
        where: { id: so.appointmentId },
        data: { status: 'em_execucao' },
      }),
    ])
    return updated
  }

  async finish(id: string, dto: FinishServiceOrderDto) {
    const so = await this.findOne(id)
    if (so.status !== 'em_execucao') {
      throw new BadRequestException('Somente ordens em execução podem ser finalizadas')
    }

    const [updated] = await Promise.all([
      this.prisma.serviceOrder.update({
        where: { id },
        data: {
          status: 'concluida',
          finishedAt: new Date(),
          clientSignature: dto.clientSignature,
          observations: dto.observations,
        },
        include: SO_INCLUDE,
      }),
      this.prisma.appointment.update({
        where: { id: so.appointmentId },
        data: { status: 'concluido' },
      }),
    ])
    return updated
  }

  async updateChecklist(id: string, dto: UpdateChecklistDto) {
    await this.findOne(id)

    await Promise.all(
      dto.items.map((item) =>
        this.prisma.serviceChecklist.update({
          where: { id: item.id },
          data: { completed: item.completed, notes: item.notes },
        }),
      ),
    )

    return this.findOne(id)
  }

  async uploadPhotos(
    id: string,
    type: 'before' | 'after',
    files: Express.Multer.File[],
  ) {
    const so = await this.findOne(id)

    const uploadDir = join(process.cwd(), 'uploads', 'os', id, type)
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

    const paths = files.map((f) => `uploads/os/${id}/${type}/${f.filename}`)
    const field = type === 'before' ? 'beforePhotos' : 'afterPhotos'
    const current = (so[field] as string[]) ?? []

    return this.prisma.serviceOrder.update({
      where: { id },
      data: { [field]: [...current, ...paths] },
      include: SO_INCLUDE,
    })
  }
}
