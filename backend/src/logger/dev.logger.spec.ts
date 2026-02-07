import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    logger = new JsonLogger();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T10:30:45.123Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should log message in JSON format', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    logger.log('Test message', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'LOG',
        message: 'Test message',
        context: 'TestContext',
        pid: process.pid,
        env: 'test'
      })
    );
    
    consoleSpy.mockRestore();
  });

  it('should error message with stack trace in JSON format', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const stackTrace = 'Error: Something went wrong\n    at test.js:1:1';
    logger.error('Error message', stackTrace, 'ErrorContext');
    
    expect(consoleSpy).toHaveBeenCalledWith(
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
    
    consoleSpy.mockRestore();
  });

  it('should use default context when not provided', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    logger.log('Message without context');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2026-01-15T10:30:45.123Z',
        level: 'LOG',
        message: 'Message without context',
        context: 'default',
        pid: process.pid,
        env: 'test'
      })
    );
    
    consoleSpy.mockRestore();
  });
});