import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatTSKV(level: string, message: any, ...optionalParams: any[]): string {
    const timestamp = new Date().toISOString();
    
    // Определяем контекст и стектрейс
    let context = 'default';
    let stack: string | undefined;
    
    if (optionalParams.length > 0) {
      // Если level = 'error', то optionalParams[0] = stack, optionalParams[1] = context
      if (level === 'error') {
        if (optionalParams.length > 0) {
          stack = optionalParams[0];
        }
        if (optionalParams.length > 1) {
          context = optionalParams[1];
        }
      } else {
        // Для других уровней optionalParams[0] = context
        context = optionalParams[0] || 'default';
      }
    }
    
    const msg = typeof message === 'object' ? JSON.stringify(message) : String(message);
    
    const fields = [
      `timestamp=${timestamp}`,
      `level=${level}`,
      `message=${this.escapeTSKV(msg)}`,
      `context=${context}`,
      `pid=${process.pid}`,
      `env=${process.env.NODE_ENV || 'development'}`,
    ];

    // Добавляем stack trace для ошибок
    if (stack) {
      fields.push(`stack=${this.escapeTSKV(stack)}`);
    }

    return fields.join('\t');
  }

  private escapeTSKV(value: string): string {
    // Экранируем специальные символы для TSKV
    return value
      .replace(/\\/g, '\\\\')  // сначала экранируем обратные слеши
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatTSKV('log', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatTSKV('error', message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatTSKV('warn', message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatTSKV('debug', message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.log(this.formatTSKV('verbose', message, ...optionalParams));
  }
}