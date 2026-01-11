import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto, OrderResponseDto } from '../dto/order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
    const { tickets, email, phone } = createOrderDto;

    // Рассчитываем сумму
    const total = tickets.reduce((sum: number, item) => {
      return sum + (item.price ? Number(item.price) : 0);
    }, 0);

    // Создаем заказ
    const order = this.orderRepository.create({
      email,
      phone,
      items: tickets.map(item => ({
        film: item.film,
        session: item.session,
        daytime: item.daytime,
        row: item.row,
        seat: item.seat,
        price: item.price,
        seatKey: `${item.row}:${item.seat}`,
      })),
      total,
    });

    const savedOrder = await this.orderRepository.save(order);
    
    return {
      total: savedOrder.total,
      items: savedOrder.items.map(item => ({
        film: item.film,
        session: item.session,
        daytime: item.daytime,
        row: item.row,
        seat: item.seat,
        price: item.price,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
  }
}