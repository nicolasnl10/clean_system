import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { TeamsService } from './teams.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { AddMemberDto } from './dto/add-member.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto)
  }

  @Roles('admin', 'supervisor', 'atendimento')
  @Get()
  findAll() {
    return this.teamsService.findAll()
  }

  @Roles('admin', 'supervisor', 'atendimento')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id)
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto)
  }

  @Roles('admin', 'supervisor')
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.teamsService.addMember(id, dto)
  }

  @Roles('admin', 'supervisor')
  @Delete(':id/members/:employeeId')
  removeMember(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.teamsService.removeMember(id, employeeId)
  }
}
