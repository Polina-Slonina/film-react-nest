import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmRepository } from './repositories/film.repository';
import { Film } from './entities/film.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  controllers: [FilmsController],
  providers: [FilmsService, FilmRepository],
  exports: [FilmsService, FilmRepository],
})

export class FilmsModule {}