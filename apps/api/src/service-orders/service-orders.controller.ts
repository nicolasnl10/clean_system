import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { ServiceOrdersService } from './service-orders.service'
import { CreateServiceOrderDto } from './dto/create-service-order.dto'
import { UpdateChecklistDto } from './dto/update-checklist.dto'
import { FinishServiceOrderDto } from './dto/finish-service-order.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private serviceOrdersService: ServiceOrdersService) {}

  @Roles('admin', 'atendimento')
  @Post()
  create(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(dto)
  }

  @Roles('admin', 'atendimento', 'supervisor', 'funcionario')
  @Get()
  findAll(@Query('appointmentId') appointmentId?: string) {
    return this.serviceOrdersService.findAll(appointmentId)
  }

  @Roles('admin', 'atendimento', 'supervisor', 'funcionario')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id)
  }

  @Roles('admin', 'supervisor', 'funcionario')
  @Patch(':id/start')
  start(@Param('id') id: string) {
    return this.serviceOrdersService.start(id)
  }

  @Roles('admin', 'supervisor', 'funcionario')
  @Patch(':id/finish')
  finish(@Param('id') id: string, @Body() dto: FinishServiceOrderDto) {
    return this.serviceOrdersService.finish(id, dto)
  }

  @Roles('admin', 'supervisor', 'funcionario')
  @Patch(':id/checklist')
  updateChecklist(@Param('id') id: string, @Body() dto: UpdateChecklistDto) {
    return this.serviceOrdersService.updateChecklist(id, dto)
  }

  @Roles('admin', 'supervisor', 'funcionario')
  @Post(':id/photos/:type')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const soId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
          const photoType = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type
          const dir = join(process.cwd(), 'uploads', 'os', soId, photoType)
          cb(null, dir)
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${unique}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp']
        cb(null, allowed.includes(extname(file.originalname).toLowerCase()))
      },
    }),
  )
  uploadPhotos(
    @Param('id') id: string,
    @Param('type') type: 'before' | 'after',
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.serviceOrdersService.uploadPhotos(id, type, files)
  }
}
