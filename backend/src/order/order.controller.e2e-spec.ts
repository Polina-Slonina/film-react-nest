import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let orderService: OrderService;

  const mockOrderRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(Order))
    .useValue(mockOrderRepository)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    await app.init();

    orderService = moduleFixture.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /order', () => {
    const validOrderData = {
      email: 'test@example.com',
      phone: '+79991234567',
      tickets: [
        {
          film: 'film-123',
          session: 'session-456',
          daytime: '2024-01-15T18:00:00',
          row: 1,
          seat: 5,
          price: 500,
        },
        {
          film: 'film-123',
          session: 'session-456',
          daytime: '2024-01-15T18:00:00',
          row: 1,
          seat: 6,
          price: 500,
        },
      ],
    };

    it('should create order with valid data (201)', async () => {
      const mockResponse = {
        id: 1,
        ...validOrderData,
        total: 1000,
        items: validOrderData.tickets.map(t => ({
          ...t,
          seatKey: `${t.row}-${t.seat}`,
        })),
      };

      jest.spyOn(orderService, 'createOrder').mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/order')
        .send(validOrderData)
        .expect(201);

      expect(response.body).toMatchObject({
        email: 'test@example.com',
        phone: '+79991234567',
        total: 1000,
      });
      expect(response.body.items).toHaveLength(2);
      expect(orderService.createOrder).toHaveBeenCalledWith(validOrderData);
    });

    it('should reject invalid email (400)', async () => {
      const invalidData = {
        ...validOrderData,
        email: 'not-an-email',
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('email');
        });

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should reject empty email (400)', async () => {
      const invalidData = {
        ...validOrderData,
        email: '',
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400);

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should reject empty phone (400)', async () => {
      const invalidData = {
        ...validOrderData,
        phone: '',
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400);

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should reject empty tickets array (400)', async () => {
      const invalidData = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [],
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400);

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should reject ticket without required fields (400)', async () => {
      const invalidData = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            // Не хватает обязательных полей
            film: 'film-123',
            // session пропущен
            daytime: '2026-01-15T18:00:00',
            row: 1,
            seat: 5,
            price: 500,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400);

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should reject negative price (400)', async () => {
      const invalidData = {
        ...validOrderData,
        tickets: [
          {
            ...validOrderData.tickets[0],
            price: -100,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400);

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should reject additional properties (400)', async () => {
      const invalidData = {
        ...validOrderData,
        extraField: 'should not be here',
        tickets: validOrderData.tickets.map(t => ({
          ...t,
          extraTicketField: 'also should not be here',
        })),
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidData)
        .expect(400);

      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should handle service error (500)', async () => {
      jest.spyOn(orderService, 'createOrder')
        .mockRejectedValue(new Error('Database connection failed'));

      await request(app.getHttpServer())
        .post('/order')
        .send(validOrderData)
        .expect(500);

      expect(orderService.createOrder).toHaveBeenCalledWith(validOrderData);
    });
  });
});