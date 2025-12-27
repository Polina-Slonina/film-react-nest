import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResponseDto, CreateOrderDto } from './dto/order.dto';

@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.orderService.createOrder(createOrderDto);
  }
}