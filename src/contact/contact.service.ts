import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from '../auth/dto/create-contact.dto';
import { UpdateContactDto } from '../auth/dto/update-contact.dto';
import { ContactResponseDto } from '../auth/dto/contact-response.dto';


@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        userId,
      },
    });

    return contact;
  }

  async findAll(userId: number): Promise<ContactResponseDto[]> {
    const contacts = await this.prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return contacts;
  }

  async findOne(id: number, userId: number): Promise<ContactResponseDto> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException('You do not have access to this contact');
    }

    return contact;
  }

  async update(
    id: number,
    userId: number,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    // Check if contact exists and belongs to user
    await this.findOne(id, userId);

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });

    return contact;
  }

  async remove(id: number, userId: number): Promise<void> {
    // Check if contact exists and belongs to user
    await this.findOne(id, userId);

    await this.prisma.contact.delete({
      where: { id },
    });
  }
}