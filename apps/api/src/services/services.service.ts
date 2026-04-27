import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateServiceDto } from './dto/create-service.dto'
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto'

const SERVICE_INCLUDE = {
  checklistTemplates: {
    where: { active: true },
    orderBy: { orderIndex: 'asc' as const },
  },
}

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: { ...dto, active: dto.active ?? true }, include: SERVICE_INCLUDE })
  }

  findAll() {
    return this.prisma.service.findMany({ include: SERVICE_INCLUDE, orderBy: { name: 'asc' } })
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id }, include: SERVICE_INCLUDE })
    if (!service) throw new NotFoundException('Serviço não encontrado')
    return service
  }

  async update(id: string, dto: Partial<CreateServiceDto>) {
    await this.findOne(id)
    return this.prisma.service.update({ where: { id }, data: dto, include: SERVICE_INCLUDE })
  }

  async addChecklistTemplate(serviceId: string, dto: CreateChecklistTemplateDto) {
    await this.findOne(serviceId)
    return this.prisma.serviceChecklistTemplate.create({
      data: { serviceId, itemName: dto.itemName, orderIndex: dto.orderIndex ?? 0 },
    })
  }

  async removeChecklistTemplate(serviceId: string, templateId: string) {
    await this.findOne(serviceId)
    const template = await this.prisma.serviceChecklistTemplate.findFirst({
      where: { id: templateId, serviceId },
    })
    if (!template) throw new NotFoundException('Item de template não encontrado')
    return this.prisma.serviceChecklistTemplate.update({
      where: { id: templateId },
      data: { active: false },
    })
  }
}
