import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column('jsonb')
  items: Array<{
    film: string;
    session: string;
    daytime: string;
    row: number;
    seat: number;
    price: number;
    seatKey: string;
  }>;

  @Column()
  total: number;
}