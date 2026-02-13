import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import  request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ContactController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;
  let contactId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.contact.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user and get token
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contact-test@example.com',
        password: 'password123',
        name: 'Contact Test User',
      });

    authToken = response.body.data.accessToken;
    userId = response.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/contacts (POST)', () => {
    it('should create a new contact', async () => {
      const res = await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.userId).toBe(userId);
      contactId = res.body.data.id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'Jane Doe',
          phone: '+1234567891',
        });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Jane Doe',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('/contacts (GET)', () => {
    it('should get all contacts for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/contacts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/contacts');
      expect(res.status).toBe(401);
    });
  });

  describe('/contacts/:id (GET)', () => {
    it('should get a specific contact', async () => {
      const res = await request(app.getHttpServer())
        .get(`/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(contactId);
      expect(res.body.data.name).toBe('John Doe');
    });

    it('should fail with non-existent contact', async () => {
      const res = await request(app.getHttpServer())
        .get('/contacts/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('/contacts/:id (PATCH)', () => {
    it('should update a contact', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Updated',
          phone: '+9876543210',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Updated');
      expect(res.body.data.phone).toBe('+9876543210');
    });
  });

  describe('/contacts/:id (DELETE)', () => {
    it('should delete a contact', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });

    it('should fail to get deleted contact', async () => {
      const res = await request(app.getHttpServer())
        .get(`/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Authorization Tests', () => {
    let user2Token: string;
    let user2ContactId: number;

    beforeAll(async () => {
      // Create second user
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user2@example.com',
          password: 'password123',
          name: 'User 2',
        });

      user2Token = response.body.data.accessToken;

      // Create contact for user 2
      const contactResponse = await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'User 2 Contact',
          phone: '+1111111111',
        });

      user2ContactId = contactResponse.body.data.id;
    });

    it('should not allow user 1 to access user 2 contact', async () => {
      const res = await request(app.getHttpServer())
        .get(`/contacts/${user2ContactId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have access');
    });

    it('should not allow user 1 to update user 2 contact', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/contacts/${user2ContactId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Hacked Name',
        });

      expect(res.status).toBe(403);
    });

    it('should not allow user 1 to delete user 2 contact', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/contacts/${user2ContactId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });
  });
});