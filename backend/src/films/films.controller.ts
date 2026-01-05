import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { FilmRepository } from './repositories/film.repository';
import { FilmsService } from './films.service';

@Controller('/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  // получение всех фильмов
   @Get()
  async findAll() {
    return this.filmsService.findAll();
  }

  // получение расписания фильма
  @Get(':id/schedule')
  async getSchedule(@Param('id') id: string) {
    const schedule = await this.filmsService.getSchedule(id);
    return schedule;
  }
}