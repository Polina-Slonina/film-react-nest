import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(level: string, message: any, ...optionalParams: any[]) {
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
    
    const logEntry: any = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      context: context,
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
    };

    // Добавляем stack trace для ошибок
    if (stack) {
      logEntry['stack'] = stack;
    }

    return JSON.stringify(logEntry);
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('verbose', message, ...optionalParams));
  }
}