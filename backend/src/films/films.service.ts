import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmRepository } from './repositories/film.repository';
import { FilmDto, ScheduleItemDto, ScheduleResponseDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmRepository: FilmRepository) {}

  // Создание фильма
  async create(createFilmDto: FilmDto) {
    return this.filmRepository.create(createFilmDto);
  }

  // Получение всех фильмов
  async findAll() {
    return this.filmRepository.findAll();
  }

  // Получение одного фильма
  async findOne(id: string) {
    const film = await this.filmRepository.findById(id);
    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }
    return film;
  }

  // Получение расписания фильма
  async getSchedule(id: string): Promise<ScheduleResponseDto | null> {
    const schedule = await this.filmRepository.getSchedule(id);
    if (!schedule) {
      throw new NotFoundException(`Film with id ${id} not found or has no schedule`);
    }
    return schedule;
  }
}
