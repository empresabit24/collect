import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CollectService } from './collect.service';
import { CreateCollectDto } from './dto/create-collect.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';

@Controller('collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post('createReceivable')
  createReceivable(@Body() createReceivableDto: CreateReceivableDto) {
    return this.collectService.createReceivable(createReceivableDto);
  }
  @Post('createCollect')
  createCollect(@Body() createCollectDto: CreateCollectDto) {
    return this.collectService.createCollect(createCollectDto);
  }

  @Get()
  findAll() {
    return this.collectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectService.findOne(+id);
  }
}
