import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './schemas/order.schema';
import { CreateOrderDto, OrderItemDto, OrderResponseDto } from './dto/order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    
    const { tickets, email, phone } = createOrderDto;

    //Валидация 
    if (!Array.isArray(tickets) || tickets.length === 0) {
      throw new BadRequestException('Tickets must be a non-empty array');
    }

    if (!email || !phone) {
      throw new Error('Email and phone are required');
    }

    // проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Рассчитываем сумму
    const total = tickets.reduce((sum: number, item: OrderItemDto) => {
      const price = item.price ? Number(item.price) : 0;
      return sum + price;
    }, 0);

    const order = new this.orderModel({
      email: email,
      phone: phone,
      items: tickets.map(item => ({
        id: uuidv4(), // Добавляем id 
        film: item.film,
        session: item.session,
        daytime: new Date(item.daytime),
        row: item.row,
        seat: item.seat,
        price: item.price,
        // Сохраняем ключ места для удобства
        seatKey: `${item.row}:${item.seat}`,
      })),
      total,

    });
    
    try {
      const savedOrder = await order.save();
      
      return {
        total: savedOrder.total,
        items: savedOrder.items.map(item => ({
          film: item.film,
          session: item.session,
          daytime: item.daytime.toISOString(),
          row: item.row,
          seat: item.seat,
          price: item.price,
        })),
      };
    } catch (error) {
      // Логирование ошибки
      console.error('Order creation failed:', error);
      throw new BadRequestException('Failed to create order');
    }
  }
}