import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { FilmsService } from './films.service';

describe('FilmsController (e2e)', () => {
  let app: INestApplication;
  let filmsService: FilmsService;

  const mockFilmsService = {
    findAll: jest.fn(),
    getSchedule: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(FilmsService)
    .useValue(mockFilmsService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    filmsService = moduleFixture.get<FilmsService>(FilmsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /films', () => {
    it('should return all films with correct DTO structure (200)', async () => {
      const mockFilmsResponse = {
        total: 2,
        items: [
          {
            id: 'film-1',
            title: 'Film One',
            rating: 8.5,
            director: 'Director One',
            tags: ['action'],
            image: 'http://example.com/image1.jpg',
            cover: 'http://example.com/cover1.jpg',
            about: 'About film one',
            description: 'Description',
            schedule: [
              {
                id: 'schedule-1',
                daytime: '2024-01-15T18:00:00',
                hall: 1,
                rows: 10,
                seats: 100,
                price: 500,
                taken: [],
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
            description: 'Description',
            schedule: [],
          },
        ],
      };

      mockFilmsService.findAll.mockResolvedValue(mockFilmsResponse);

      const response = await request(app.getHttpServer())
        .get('/films')
        .expect(200);

      expect(response.body).toEqual(mockFilmsResponse);
      expect(filmsService.findAll).toHaveBeenCalled();
      expect(response.body.total).toBe(2);
      expect(response.body.items).toHaveLength(2);
      
      // Проверяем структуру первого фильма
      expect(response.body.items[0]).toHaveProperty('id');
      expect(response.body.items[0]).toHaveProperty('title');
      expect(response.body.items[0]).toHaveProperty('schedule');
      expect(Array.isArray(response.body.items[0].schedule)).toBe(true);
      
      // Проверяем структуру расписания
      if (response.body.items[0].schedule.length > 0) {
        expect(response.body.items[0].schedule[0]).toHaveProperty('hall');
        expect(response.body.items[0].schedule[0]).toHaveProperty('price');
        expect(response.body.items[0].schedule[0]).toHaveProperty('taken');
        expect(Array.isArray(response.body.items[0].schedule[0].taken)).toBe(true);
      }
    });

    it('should return empty films list (200)', async () => {
      const mockFilmsResponse = {
        total: 0,
        items: [],
      };

      mockFilmsService.findAll.mockResolvedValue(mockFilmsResponse);

      const response = await request(app.getHttpServer())
        .get('/films')
        .expect(200);

      expect(response.body).toEqual(mockFilmsResponse);
      expect(response.body.total).toBe(0);
      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('GET /films/:id/schedule', () => {
    it('should return film schedule with correct DTO structure (200)', async () => {
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
            taken: [],
          },
          {
            id: 'schedule-2',
            daytime: '2024-01-15T20:00:00',
            hall: 2,
            rows: 8,
            seats: 80,
            price: 600,
            taken: ['1-5', '2-10'],
          },
        ],
      };

      mockFilmsService.getSchedule.mockResolvedValue(mockScheduleResponse);

      const response = await request(app.getHttpServer())
        .get(`/films/${filmId}/schedule`)
        .expect(200);

      expect(response.body).toEqual(mockScheduleResponse);
      expect(filmsService.getSchedule).toHaveBeenCalledWith(filmId);
      expect(response.body.total).toBe(2);
      expect(response.body.items).toHaveLength(2);
      
      // Проверяем структуру элемента расписания
      expect(response.body.items[0]).toHaveProperty('id');
      expect(response.body.items[0]).toHaveProperty('daytime');
      expect(response.body.items[0]).toHaveProperty('hall');
      expect(response.body.items[0]).toHaveProperty('rows');
      expect(response.body.items[0]).toHaveProperty('seats');
      expect(response.body.items[0]).toHaveProperty('price');
      expect(response.body.items[0]).toHaveProperty('taken');
      expect(Array.isArray(response.body.items[0].taken)).toBe(true);
    });

    it('should return empty schedule array (200)', async () => {
      const filmId = 'film-no-schedule';
      const mockScheduleResponse = {
        total: 0,
        items: [],
      };

      mockFilmsService.getSchedule.mockResolvedValue(mockScheduleResponse);

      const response = await request(app.getHttpServer())
        .get(`/films/${filmId}/schedule`)
        .expect(200);

      expect(response.body).toEqual(mockScheduleResponse);
      expect(response.body.total).toBe(0);
      expect(response.body.items).toHaveLength(0);
    });

    it('should return null for non-existent film (200)', async () => {
      const filmId = 'non-existent';
      mockFilmsService.getSchedule.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/films/${filmId}/schedule`)
        .expect(200);

      expect(response.body).toBeNull();
    });
  });
});