import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('E-mail já cadastrado')

    const passwordHash = await bcrypt.hash(dto.password, 10)

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        active: dto.active ?? true,
      },
      select: USER_SELECT,
    })
  }

  findAll() {
    return this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    return user
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id)

    if (dto.email) {
      const conflict = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      })
      if (conflict) throw new ConflictException('E-mail já cadastrado')
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    })
  }

  async deactivate(id: string) {
    await this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
      select: USER_SELECT,
    })
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!isMatch) throw new UnauthorizedException('Senha atual incorreta')

    const passwordHash = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({ where: { id }, data: { passwordHash } })

    return { message: 'Senha alterada com sucesso' }
  }
}
