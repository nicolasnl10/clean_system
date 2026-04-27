import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { JwtPayload } from './strategies/jwt.strategy'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) return null

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return null

    const { passwordHash: _, ...result } = user
    return result
  }

  login(user: { id: string; email: string; role: string; name: string }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role }
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  }
}
