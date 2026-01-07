import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from './repository/order.repository';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';
import { FilmRepository } from '../films/repositories/film.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly filmRepository: FilmRepository,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { tickets, email, phone } = createOrderDto;
    
    // Проверяем доступность всех мест
    await this.checkSeatsAvailability(tickets);
    
    try {
      // бронируем места
      await this.reserveSeats(tickets);
      
      // Создаем заказ
      const order = await this.orderRepository.create(createOrderDto);
      
      return order;
    } catch (error) {
      // При ошибке откатываем бронирование
      await this.releaseSeats(tickets);
      throw error;
    }
  }

  private async checkSeatsAvailability(tickets: any[]): Promise<void> {
    // Группируем билеты по сеансам
    const ticketsBySession = new Map<string, any[]>();
    
    for (const ticket of tickets) {
      const key = `${ticket.film}:${ticket.session}`;
      if (!ticketsBySession.has(key)) {
        ticketsBySession.set(key, []);
      }
      ticketsBySession.get(key)!.push(ticket);
    }
    
    // Проверяем каждую группу
    for (const [key, sessionTickets] of ticketsBySession.entries()) {
      const [filmId, sessionId] = key.split(':');
      
      const film = await this.filmRepository.findById(filmId);
      if (!film) {
        throw new NotFoundException(`Фильм ${filmId} не найден`);
      }
      
      const schedule = film.schedule?.find(s => s.id === sessionId);
      if (!schedule) {
        throw new NotFoundException(`Сеанс ${sessionId} не найден`);
      }
      
      // Проверяем каждое место
      for (const ticket of sessionTickets) {
        const seatKey = `${ticket.row}:${ticket.seat}`;
        
        // Проверка границ
        if (ticket.row > schedule.rows || ticket.seat > schedule.seats) {
          throw new BadRequestException(`Место ${seatKey} не существует`);
        }
        
        // Проверка занятости
        if (schedule.taken?.includes(seatKey)) {
          throw new ConflictException(`Место ${seatKey} уже занято`);
        }
      }
    }
  }

  // Бронирование мест
  private async reserveSeats(tickets: any[]): Promise<void> {
    const seatsBySession = new Map<string, Array<{row: number, seat: number}>>();
    
    for (const ticket of tickets) {
      const key = `${ticket.film}:${ticket.session}`;
      if (!seatsBySession.has(key)) {
        seatsBySession.set(key, []);
      }
      seatsBySession.get(key)!.push({
        row: ticket.row,
        seat: ticket.seat,
      });
    }
    
    for (const [key, seats] of seatsBySession.entries()) {
      const [filmId, sessionId] = key.split(':');
      await this.addSeatsToTaken(filmId, sessionId, seats);
    }
  }

  // Откат бронирования
  private async releaseSeats(tickets: any[]): Promise<void> {
  const seatsBySession = new Map<string, string[]>();
  
  for (const ticket of tickets) {
    const key = `${ticket.film}:${ticket.session}`;
    const seatKey = `${ticket.row}:${ticket.seat}`;
    
    if (!seatsBySession.has(key)) {
      seatsBySession.set(key, []);
    }
    seatsBySession.get(key)!.push(seatKey);
  }
  
  for (const [key, seatKeys] of seatsBySession.entries()) {
    const [filmId, sessionId] = key.split(':');
    await this.filmRepository.releaseSeats(filmId, sessionId, seatKeys);
  }
}

  // Получение доступных мест
  async getAvailableSeats(id: string, sessionId: string) {
  const film = await this.filmRepository.findById(id);
  
  if (!film) {
    throw new NotFoundException(`Фильм с ID ${id} не найден`);
  }

  const scheduleItem = film.schedule?.find(item => item.id === sessionId);

  if (!scheduleItem) {
    throw new NotFoundException(`Сеанс с ID ${sessionId} не найден`);
  }

  const totalSeats = scheduleItem.rows * scheduleItem.seats;
  const takenSeats = scheduleItem.taken?.length || 0;
  const availableSeats = totalSeats - takenSeats;

  // Генерируем карту мест
  const seatsMap = [];
  for (let row = 1; row <= scheduleItem.rows; row++) {
    const rowSeats = [];
    for (let seat = 1; seat <= scheduleItem.seats; seat++) {
      const seatKey = `${row}:${seat}`;
      rowSeats.push({
        seat,
        available: !scheduleItem.taken?.includes(seatKey),
      });
    }
    seatsMap.push({
      row,
      seats: rowSeats,
    });
  }

  return {
    id,
    sessionId,
    hall: scheduleItem.hall,
    daytime: scheduleItem.daytime,
    totalSeats,
    takenSeats,
    availableSeats,
    price: scheduleItem.price,
    seatsMap,
  };
}

  // метод добавления мест в занятые
    private async addSeatsToTaken(
      filmId: string,
      sessionId: string,
      seats: Array<{row: number, seat: number}>,
    ): Promise<void> {
      const seatKeys = seats.map(seat => `${seat.row}:${seat.seat}`);
      
      const success = await this.filmRepository.addSeatsToTaken(
        filmId,
        sessionId,
        seatKeys,
      );

      if (!success) {
        throw new ConflictException(
          `Места уже заняты на сеансе ${sessionId}`
        );
      }
    }
}
