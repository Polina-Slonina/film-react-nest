import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    logger = new JsonLogger();
    
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
    };
    
    // Mock Date for consistent timestamps
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T10:30:45.123Z'));
    
    // Установите NODE_ENV для тестов
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
  });

  it('should log message in JSON format', () => {
    logger.log('Test message', 'TestContext');
    
    expect(consoleSpy.log).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'LOG',
        message: 'Test message',
        context: 'TestContext',
        pid: process.pid,
        env: 'test'
      })
    );
  });

  it('should error message with stack trace in JSON format', () => {
    const stackTrace = 'Error: Something went wrong\n    at test.js:1:1';
    logger.error('Error message', stackTrace, 'ErrorContext');
    
    expect(consoleSpy.error).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'ERROR',
        message: 'Error message',
        context: 'ErrorContext',
        pid: process.pid,
        env: 'test',
        stack: stackTrace
      })
    );
  });

  it('should warn message in JSON format', () => {
    logger.warn('Warning message', 'WarnContext');
    
    expect(consoleSpy.warn).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'WARN',
        message: 'Warning message',
        context: 'WarnContext',
        pid: process.pid,
        env: 'test'
      })
    );
  });

  it('should serialize objects in messages', () => {
    const testObject = { key: 'value', number: 123 };
    logger.log(testObject, 'ObjectContext');
    
    expect(consoleSpy.log).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'LOG',
        message: JSON.stringify(testObject),
        context: 'ObjectContext',
        pid: process.pid,
        env: 'test'
      })
    );
  });

  it('should use default context when not provided', () => {
    logger.log('Message without context');
    
    expect(consoleSpy.log).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'LOG',
        message: 'Message without context',
        context: 'default',
        pid: process.pid,
        env: 'test'
      })
    );
  });

  it('should debug message in JSON format', () => {
    logger.debug('Debug message', 'DebugContext');
    
    expect(consoleSpy.debug).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'DEBUG',
        message: 'Debug message',
        context: 'DebugContext',
        pid: process.pid,
        env: 'test'
      })
    );
  });

  it('should verbose message in JSON format', () => {
    logger.verbose('Verbose message', 'VerboseContext');
    
    expect(consoleSpy.log).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'VERBOSE',
        message: 'Verbose message',
        context: 'VerboseContext',
        pid: process.pid,
        env: 'test'
      })
    );
  });

  it('should use development env when NODE_ENV is not set', () => {
    // Удаляем NODE_ENV для этого теста
    delete process.env.NODE_ENV;
    
    // Пересоздаем логгер, чтобы он подхватил изменения
    logger = new JsonLogger();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    logger.log('Test message', 'TestContext');
    
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'LOG',
        message: 'Test message',
        context: 'TestContext',
        pid: process.pid,
        env: 'development'  // должно быть development, когда NODE_ENV не установлен
      })
    );
    
    logSpy.mockRestore();
  });
});