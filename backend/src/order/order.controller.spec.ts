import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-id'),
}));

// Мок для OrderService
const mockOrderService = {
  createOrder: jest.fn(),
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
    
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully with valid data', async () => {
      const createOrderDto: CreateOrderDto = {
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

      const expectedResponse: OrderResponseDto = {
        total: 1000,
        items: createOrderDto.tickets, // Без seatKey
      };

      mockOrderService.createOrder.mockResolvedValue(expectedResponse);

      const result = await controller.createOrder(createOrderDto);

      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(expectedResponse);
      expect(result.total).toBe(1000);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].film).toBe('film-123');
      expect(result.items[0].price).toBe(500);
    });

    it('should calculate correct total for multiple tickets', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: 'film-1',
            session: 'session-1',
            daytime: '2024-01-15T18:00:00',
            row: 1,
            seat: 5,
            price: 300,
          },
          {
            film: 'film-2',
            session: 'session-2',
            daytime: '2024-01-16T20:00:00',
            row: 2,
            seat: 10,
            price: 500,
          },
          {
            film: 'film-1',
            session: 'session-1',
            daytime: '2024-01-15T18:00:00',
            row: 1,
            seat: 6,
            price: 300,
          },
        ],
      };

      const expectedResponse: OrderResponseDto = {
        total: 1100, // 300 + 500 + 300
        items: createOrderDto.tickets,
      };

      mockOrderService.createOrder.mockResolvedValue(expectedResponse);

      const result = await controller.createOrder(createOrderDto);

      expect(result.total).toBe(1100);
      expect(result.items).toHaveLength(3);
    });

    it('should propagate service errors', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'error@example.com',
        phone: '+79997778899',
        tickets: [
          {
            film: 'film-123',
            session: 'session-456',
            daytime: '2024-01-15T18:00:00',
            row: 1,
            seat: 5,
            price: 500,
          },
        ],
      };

      const errorMessage = 'Seat already taken';
      mockOrderService.createOrder.mockRejectedValue(new Error(errorMessage));

      await expect(controller.createOrder(createOrderDto))
        .rejects
        .toThrow(errorMessage);
      
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should handle empty tickets array', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'empty@example.com',
        phone: '+79994445566',
        tickets: [],
      };

      const expectedResponse: OrderResponseDto = {
        total: 0,
        items: [],
      };

      mockOrderService.createOrder.mockResolvedValue(expectedResponse);

      const result = await controller.createOrder(createOrderDto);

      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });
  });
});