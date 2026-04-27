import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ServicesService } from './services.service'
import { CreateServiceDto } from './dto/create-service.dto'
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto)
  }

  @Roles('admin', 'atendimento', 'supervisor')
  @Get()
  findAll() {
    return this.servicesService.findAll()
  }

  @Roles('admin', 'atendimento', 'supervisor')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id)
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto>) {
    return this.servicesService.update(id, dto)
  }

  @Roles('admin')
  @Post(':id/checklist-templates')
  addTemplate(@Param('id') id: string, @Body() dto: CreateChecklistTemplateDto) {
    return this.servicesService.addChecklistTemplate(id, dto)
  }

  @Roles('admin')
  @Delete(':id/checklist-templates/:templateId')
  removeTemplate(@Param('id') id: string, @Param('templateId') templateId: string) {
    return this.servicesService.removeChecklistTemplate(id, templateId)
  }
}
