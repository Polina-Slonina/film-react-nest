import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../entities/film.entity';
import { Schedule } from '../entities/schedule.entity';
import { FilmDto, FilmsResponseDto, ScheduleResponseDto } from '../dto/films.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilmRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  // Создание фильма (без расписания)
  async create(createFilmDto: FilmDto): Promise<Film> {
    const filmId = uuidv4();
    
    // Создаем только фильм, без schedule
    const film = this.filmRepository.create({
      id: filmId,
      title: createFilmDto.title,
      rating: createFilmDto.rating,
      director: createFilmDto.director,
      tags: createFilmDto.tags || [],
      about: createFilmDto.about || '',
      description: createFilmDto.description || '',
      image: createFilmDto.image || '',
      cover: createFilmDto.cover || '',
    });
    
    return this.filmRepository.save(film);
  }

  // Добавление расписания к фильму
  async addSchedule(filmId: string, scheduleItems: any[]): Promise<Film> {
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
      relations: ['schedule'] // Загружаем существующее расписание
    });

    if (!film) {
      throw new Error(`Film with id ${filmId} not found`);
    }

    // Создаем записи расписания
    const schedules = scheduleItems.map(item => {
      const schedule = new Schedule();
      schedule.id = item.id || uuidv4();
      schedule.daytime = item.daytime;
      schedule.hall = item.hall;
      schedule.rows = item.rows;
      schedule.seats = item.seats;
      schedule.price = item.price;
      schedule.taken = item.taken || [];
      schedule.film = film;
      schedule.filmId = filmId;
      return schedule;
    });

    // Сохраняем расписание
    await this.scheduleRepository.save(schedules);
    
    // Возвращаем фильм с обновленным расписанием
    return this.filmRepository.findOne({
      where: { id: filmId },
      relations: ['schedule']
    });
  }

  // Получение всех фильмов с расписанием
  async findAll(): Promise<FilmsResponseDto> {
    const films = await this.filmRepository.find({
      relations: ['schedule'],
      order: { 
        title: 'ASC',
      }
    });

    // Сортируем расписание для каждого фильма
    const filmsWithSortedSchedule = films.map(film => ({
      ...film,
      schedule: this.sortSchedule(film.schedule || [])
    }));

    return {
      total: films.length,
      items: filmsWithSortedSchedule.map(film => this.toFilmDto(film)),
    };
  }

  // Поиск по ID с расписанием
  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
    });
    
    if (!film) {
      return null;
    }

    return this.toFilmDto({
      ...film,
      schedule: this.sortSchedule(film.schedule || [])
    });
  }

  // Получение расписания фильма
  async getSchedule(filmId: string): Promise<ScheduleResponseDto | null> {
    const schedules = await this.scheduleRepository.find({
      where: { filmId },
      order: { daytime: 'ASC' }
    });
    
    if (!schedules || schedules.length === 0) {
      return null;
    }

    return {
      total: schedules.length,
      items: schedules.map(item => ({
        id: item.id,
        daytime: item.daytime,
        hall: item.hall,
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: item.taken || [],
      })),
    };
  }

  // Обновление занятых мест
  async addSeatsToTaken(
    filmId: string,
    sessionId: string,
    seatKeys: string[],
  ): Promise<boolean> {
    const schedule = await this.scheduleRepository.findOne({
      where: { 
        id: sessionId,
        filmId 
      },
    });

    if (!schedule) {
      return false;
    }

    // Проверяем, что места еще не заняты
    const existingTaken = schedule.taken || [];
    const alreadyTaken = seatKeys.some(key => existingTaken.includes(key));
    if (alreadyTaken) {
      return false;
    }

    // Добавляем места в занятые
    schedule.taken = [...existingTaken, ...seatKeys];
    await this.scheduleRepository.save(schedule);
    
    return true;
  }

  // Освобождение мест
  async releaseSeats(
    filmId: string,
    sessionId: string,
    seatKeys: string[],
  ): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({
      where: { 
        id: sessionId,
        filmId 
      },
    });

    if (schedule && schedule.taken) {
      schedule.taken = schedule.taken.filter(key => !seatKeys.includes(key));
      await this.scheduleRepository.save(schedule);
    }
  }

  // Сортировка расписания
  private sortSchedule(schedule: Schedule[]): Schedule[] {
    if (!schedule || !Array.isArray(schedule)) return [];
    
    return [...schedule].sort((a, b) => {
      if (!a.daytime || !b.daytime) return 0;
      return new Date(a.daytime).getTime() - new Date(b.daytime).getTime();
    });
  }

  // Преобразование в DTO
  private toFilmDto(film: Film): FilmDto {
    return {
      id: film.id,
      title: film.title,
      rating: film.rating,
      director: film.director,
      tags: film.tags || [],
      about: film.about || '',
      description: film.description || '',
      image: film.image || '',
      cover: film.cover || '',
      schedule: (film.schedule || []).map(item => ({
        id: item.id,
        daytime: item.daytime,
        hall: item.hall,
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: item.taken || [],
      })),
    };
  }
}