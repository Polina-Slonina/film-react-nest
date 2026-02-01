import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    logger = new TskvLogger();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T10:30:45.123Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should log message in TSKV format', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    logger.log('Test message', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      `timestamp=2026-01-15T10:30:45.123Z\tlevel=log\tmessage=Test message\tcontext=TestContext\tpid=${process.pid}\tenv=test`
    );
    
    consoleSpy.mockRestore();
  });

  it('should error message with stack trace in TSKV format', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const stackTrace = 'Error: Something went wrong\n    at test.js:1:1';
    logger.error('Error message', stackTrace, 'ErrorContext');
    
    const expectedMessage = `timestamp=2026-01-15T10:30:45.123Z\tlevel=error\tmessage=Error message\tcontext=ErrorContext\tpid=${process.pid}\tenv=test\tstack=Error: Something went wrong\\n    at test.js:1:1`;
    
    expect(consoleSpy).toHaveBeenCalledWith(expectedMessage);
    
    consoleSpy.mockRestore();
  });

  it('should escape special characters in TSKV format', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const messageWithSpecialChars = 'Message\twith\ntabs\tand\nnewlines';
    logger.log(messageWithSpecialChars, 'SpecialContext');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      `timestamp=2026-01-15T10:30:45.123Z\tlevel=log\tmessage=Message\\twith\\ntabs\\tand\\nnewlines\tcontext=SpecialContext\tpid=${process.pid}\tenv=test`
    );
    
    consoleSpy.mockRestore();
  });
});