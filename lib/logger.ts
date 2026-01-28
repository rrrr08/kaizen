/**
 * Client-Side Logger Utility
 * Replaces console.log with centralized logging
 */

type LogLevel = 'info' | 'warn' | 'error';

class LoggerService {
    private static instance: LoggerService;
    private isDevelopment = process.env.NODE_ENV === 'development';
    private queue: any[] = [];
    private isProcessing = false;

    private constructor() { }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    public info(event: string, data?: any, userId?: string) {
        this.log('info', event, data, userId);
    }

    public warn(event: string, data?: any, userId?: string) {
        this.log('warn', event, data, userId);
    }

    public error(event: string, error?: any, userId?: string) {
        const errorData = error instanceof Error 
            ? { ...error, message: error.message, stack: error.stack } 
            : error;
        this.log('error', event, errorData, userId);
    }

    private log(level: LogLevel, event: string, data?: any, userId?: string) {
        // Server-side: Always log to console (captured by Vercel/System)
        if (typeof window === 'undefined') {
            const msg = `[${level.toUpperCase()}] ${event}`;
            if (level === 'error') console.error(msg, data);
            else if (level === 'warn') console.warn(msg, data);
            else console.log(msg, data);
            return;
        }

        // Client-side: Log to console in development
        if (this.isDevelopment) {
            const style = level === 'error' ? 'color: red' : level === 'warn' ? 'color: orange' : 'color: blue';
            console.log(`%c[${level.toUpperCase()}] ${event}`, style, data || '');
        }

        // Send to server in production (or if forced)
        // We use a fire-and-forget approach for the client to avoid blocking
        this.sendToServer(level, event, data, userId);
    }

    private async sendToServer(level: LogLevel, event: string, data?: any, userId?: string) {
        if (typeof window === 'undefined') return;

        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level,
                    event,
                    data,
                    userId,
                    metadata: {
                        path: typeof window !== 'undefined' ? window.location.pathname : '',
                    }
                }),
                // use keepalive to ensure log is sent even if page unloads
                keepalive: true, 
            });
        } catch (err) {
            // Fallback to console if send fails, just so we don't lose it entirely in dev
            if (this.isDevelopment) {
                console.error('Failed to send log to server:', err);
            }
        }
    }
}

export const Logger = LoggerService.getInstance();
