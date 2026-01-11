//TODO описать DTO для запросов к /films

import { IsString, IsNumber, IsArray, IsNotEmpty, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class FilmDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  rating: number;

  @IsString()
  @IsNotEmpty()
  director: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsUrl()
  image: string;

  @IsUrl()
  cover: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  about: string;

  @IsString()
  description: string;

  @IsArray()
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];

}

export class FilmsResponseDto {
  @IsNumber()
  total: number;

  @IsArray()
  @Type(() => FilmDto)
  items: FilmDto[];
}

export class ScheduleItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  daytime: string;

  @IsString()
  @Type(() => Number)
  hall: number;

  @IsNumber()
  rows: number;

  @IsNumber()
  seats: number;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  taken: string[];
}

export class ScheduleResponseDto {
  @IsNumber()
  total: number;

  @IsArray()
  @Type(() => ScheduleItemDto)
  items: ScheduleItemDto[];
}

