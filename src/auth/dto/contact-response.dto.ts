export class ContactResponseDto {
  id!: number;
  name!: string;
  phone!: string;
  email!: string | null;
  userId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
