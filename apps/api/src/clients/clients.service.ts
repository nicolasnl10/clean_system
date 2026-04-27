import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { QueryClientDto } from './dto/query-client.dto'

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto })
  }

  findAll(query: QueryClientDto) {
    const { search, customerType } = query

    return this.prisma.client.findMany({
      where: {
        ...(customerType && { customerType }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { document: { contains: search } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { scheduledDate: 'desc' },
          take: 10,
          include: { service: { select: { name: true } } },
        },
      },
    })
    if (!client) throw new NotFoundException('Cliente não encontrado')
    return client
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id)
    return this.prisma.client.update({ where: { id }, data: dto })
  }
}
