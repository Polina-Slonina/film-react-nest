import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-id'),
}));

// Моки для FilmsService
const mockFilmsService = {
  findAll: jest.fn(),
  getSchedule: jest.fn(),
};

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
    
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all films', async () => {
      const mockFilmsResponse = {
        total: 2,
        items: [
          {
            id: 'film-1',
            title: 'Film One',
            rating: 8.5,
            director: 'Director One',
            tags: ['action', 'drama'],
            image: 'http://example.com/image1.jpg',
            cover: 'http://example.com/cover1.jpg',
            about: 'About film one',
            description: 'Description of film one',
            schedule: [
              {
                id: 'schedule-1',
                daytime: '2024-01-15T18:00:00',
                hall: 1,
                rows: 10,
                seats: 100,
                price: 500,
                taken: ['1-5'],
              },
            ],
          },
          {
            id: 'film-2',
            title: 'Film Two',
            rating: 7.2,
            director: 'Director Two',
            tags: ['comedy'],
            image: 'http://example.com/image2.jpg',
            cover: 'http://example.com/cover2.jpg',
            about: 'About film two',
            description: 'Description of film two',
            schedule: [],
          },
        ],
      };

      mockFilmsService.findAll.mockResolvedValue(mockFilmsResponse);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockFilmsResponse);
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].title).toBe('Film One');
      expect(result.items[0].schedule[0].hall).toBe(1);
    });

    it('should handle empty films list', async () => {
      const mockFilmsResponse = {
        total: 0,
        items: [],
      };

      mockFilmsService.findAll.mockResolvedValue(mockFilmsResponse);

      const result = await controller.findAll();

      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should propagate service errors', async () => {
      const errorMessage = 'Database connection failed';
      mockFilmsService.findAll.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findAll())
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('getSchedule', () => {
    it('should return schedule for a specific film', async () => {
      const filmId = 'film-123';
      const mockScheduleResponse = {
        total: 2,
        items: [
          {
            id: 'schedule-1',
            daytime: '2024-01-15T18:00:00',
            hall: 1,
            rows: 10,
            seats: 100,
            price: 500,
            taken: ['1-5', '2-10'],
          },
          {
            id: 'schedule-2',
            daytime: '2024-01-15T20:00:00',
            hall: 2,
            rows: 8,
            seats: 80,
            price: 600,
            taken: [],
          },
        ],
      };

      mockFilmsService.getSchedule.mockResolvedValue(mockScheduleResponse);

      const result = await controller.getSchedule(filmId);

      expect(service.getSchedule).toHaveBeenCalledWith(filmId);
      expect(result).toEqual(mockScheduleResponse);
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].hall).toBe(1);
      expect(result.items[1].price).toBe(600);
    });

    it('should return empty schedule for film without sessions', async () => {
      const filmId = 'film-no-schedule';
      const mockScheduleResponse = {
        total: 0,
        items: [],
      };

      mockFilmsService.getSchedule.mockResolvedValue(mockScheduleResponse);

      const result = await controller.getSchedule(filmId);

      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should handle non-existent film', async () => {
      const filmId = 'non-existent-id';
      mockFilmsService.getSchedule.mockResolvedValue(null);

      const result = await controller.getSchedule(filmId);

      expect(service.getSchedule).toHaveBeenCalledWith(filmId);
      expect(result).toBeNull();
    });

    it('should propagate service errors', async () => {
      const filmId = 'film-error';
      const errorMessage = 'Film not found';
      mockFilmsService.getSchedule.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getSchedule(filmId))
        .rejects
        .toThrow(errorMessage);
    });
  });
});