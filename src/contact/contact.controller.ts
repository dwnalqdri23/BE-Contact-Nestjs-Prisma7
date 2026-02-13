import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateContactDto } from '../auth/dto/create-contact.dto';
import { ContactResponseDto } from '../auth/dto/contact-response.dto';
import { UpdateContactDto } from '../auth/dto/update-contact.dto';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { userId: number },
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    return this.contactService.create(user.userId, createContactDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: { userId: number },
  ): Promise<ContactResponseDto[]> {
    return this.contactService.findAll(user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
  ): Promise<ContactResponseDto> {
    return this.contactService.findOne(id, user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    return this.contactService.update(id, user.userId, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
  ): Promise<void> {
    return this.contactService.remove(id, user.userId);
  }
}