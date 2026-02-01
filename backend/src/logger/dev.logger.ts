import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class DevLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context);
  }

  // метод для старта приложения
  appStarted(port: number | string) {
    const banner = `
      Film! Backend запущен!
      Адрес: http://localhost:${port}
    `;
    
    this.log(banner, 'STARTUP');
  }
}