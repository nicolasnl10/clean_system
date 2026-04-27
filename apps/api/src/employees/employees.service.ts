import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { QueryEmployeeDto } from './dto/query-employee.dto'

const EMPLOYEE_INCLUDE = {
  user: { select: { id: true, email: true, role: true, active: true } },
  teamMembers: {
    include: { team: { select: { id: true, name: true } } },
  },
}

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    const userExists = await this.prisma.user.findUnique({ where: { id: dto.userId } })
    if (!userExists) throw new NotFoundException('Usuário não encontrado')

    const alreadyLinked = await this.prisma.employee.findUnique({ where: { userId: dto.userId } })
    if (alreadyLinked) throw new ConflictException('Usuário já possui cadastro de funcionário')

    const { hireDate, ...rest } = dto
    return this.prisma.employee.create({
      data: { ...rest, hireDate: hireDate ? new Date(hireDate) : undefined },
      include: EMPLOYEE_INCLUDE,
    })
  }

  findAll(query: QueryEmployeeDto) {
    const { search, status } = query
    return this.prisma.employee.findMany({
      where: {
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search } },
            { phone: { contains: search } },
          ],
        }),
      },
      include: EMPLOYEE_INCLUDE,
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: EMPLOYEE_INCLUDE,
    })
    if (!employee) throw new NotFoundException('Funcionário não encontrado')
    return employee
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id)
    const { hireDate, ...rest } = dto
    return this.prisma.employee.update({
      where: { id },
      data: { ...rest, hireDate: hireDate ? new Date(hireDate) : undefined },
      include: EMPLOYEE_INCLUDE,
    })
  }
}
