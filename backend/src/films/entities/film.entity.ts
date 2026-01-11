import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column()
  director: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  cover: string;

  // Связь с Schedule
  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true,
  })
  schedule: Schedule[];
}