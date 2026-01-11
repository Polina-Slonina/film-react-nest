import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Film } from './film.entity';

@Entity()
export class Schedule {
  @PrimaryColumn()
  id: string;

  @Column()
  daytime: string;

  @Column()
  hall: number;

  @Column()
  rows: number;

  @Column()
  seats: number;

  @Column()
  price: number;

  @Column('text', { array: true, default: [] })
  taken: string[];

  // Связь с Film через ManyToOne
  @ManyToOne(() => Film, (film) => film.schedule, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  film: Film;

  // Внешний ключ
  @Column({ name: 'filmId' })
  filmId: string;
}