
export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'silent') return;
    const payload = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${new Date().toISOString()}] [INFO]  [${this.context}] ${message}${payload}`);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'silent') return;
    const payload = data ? ` ${JSON.stringify(data)}` : '';
    console.warn(`[${new Date().toISOString()}] [WARN]  [${this.context}] ${message}${payload}`);
  }

  error(message: string, error?: Error | unknown): void {
    const details = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error ?? '');
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message} ${details}`);
  }
}
