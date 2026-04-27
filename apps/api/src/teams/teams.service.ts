import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { AddMemberDto } from './dto/add-member.dto'

const TEAM_INCLUDE = {
  supervisor: { select: { id: true, name: true, email: true } },
  members: {
    include: {
      employee: { select: { id: true, name: true, position: true, status: true } },
    },
  },
}

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeamDto) {
    const supervisor = await this.prisma.user.findUnique({ where: { id: dto.supervisorId } })
    if (!supervisor) throw new NotFoundException('Supervisor não encontrado')
    if (supervisor.role !== 'supervisor' && supervisor.role !== 'admin') {
      throw new BadRequestException('Usuário não tem perfil de supervisor')
    }

    return this.prisma.team.create({ data: dto, include: TEAM_INCLUDE })
  }

  findAll() {
    return this.prisma.team.findMany({
      include: TEAM_INCLUDE,
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id }, include: TEAM_INCLUDE })
    if (!team) throw new NotFoundException('Equipe não encontrada')
    return team
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.findOne(id)

    if (dto.supervisorId) {
      const supervisor = await this.prisma.user.findUnique({ where: { id: dto.supervisorId } })
      if (!supervisor) throw new NotFoundException('Supervisor não encontrado')
      if (supervisor.role !== 'supervisor' && supervisor.role !== 'admin') {
        throw new BadRequestException('Usuário não tem perfil de supervisor')
      }
    }

    return this.prisma.team.update({ where: { id }, data: dto, include: TEAM_INCLUDE })
  }

  async addMember(teamId: string, dto: AddMemberDto) {
    await this.findOne(teamId)

    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } })
    if (!employee) throw new NotFoundException('Funcionário não encontrado')
    if (employee.status === 'desligado') {
      throw new BadRequestException('Funcionário desligado não pode ser adicionado a equipes')
    }

    const alreadyMember = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId, employeeId: dto.employeeId } },
    })
    if (alreadyMember) throw new ConflictException('Funcionário já é membro desta equipe')

    await this.prisma.teamMember.create({ data: { teamId, employeeId: dto.employeeId } })
    return this.findOne(teamId)
  }

  async removeMember(teamId: string, employeeId: string) {
    await this.findOne(teamId)

    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_employeeId: { teamId, employeeId } },
    })
    if (!member) throw new NotFoundException('Funcionário não é membro desta equipe')

    await this.prisma.teamMember.delete({
      where: { teamId_employeeId: { teamId, employeeId } },
    })
    return this.findOne(teamId)
  }
}
