import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Film } from '../schemas/film.schema';
import { FilmDto, FilmsResponseDto, ScheduleItemDto, ScheduleResponseDto } from '../dto/films.dto';

@Injectable()
export class FilmRepository {
  constructor(
    @InjectModel(Film.name) public readonly filmModel: Model<Film>,
  ) {}

  // Создание фильма
  async create(createFilmDto: FilmDto): Promise<Film> {
    const createdFilm = new this.filmModel(createFilmDto);
    return createdFilm.save();
  }

  // Получение всех фильмов
  async findAll(): Promise<FilmsResponseDto> {
   const items = await this.filmModel.find().exec();
    const total = items.length;

    return {
      total,
      items: items.map(film => this.toFilmDto(film)),
    };
  }

  // Поиск по ID
  async findById(id: string): Promise<FilmDto | null> {
    return this.filmModel.findOne({ id }).exec();
  }

  // Получение расписания фильма
  async getSchedule(filmId: string): Promise<ScheduleResponseDto | null> {
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    
    if (!film || !film.schedule) {
      return null;
    }

    return {
      total: film.schedule.length,
      items: film.schedule.map(item => ({
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
    };
  }
}