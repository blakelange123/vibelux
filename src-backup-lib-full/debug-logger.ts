// Debug logger that displays errors on screen
export class DebugLogger {
  private static logs: Array<{
    timestamp: string;
    type: 'log' | 'error' | 'warn';
    message: string;
    details?: any;
  }> = [];

  private static listeners: Array<(logs: typeof DebugLogger.logs) => void> = [];

  static log(message: string, details?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'log' as const,
      message,
      details
    };
    this.logs.push(entry);
    this.notifyListeners();
  }

  static error(message: string, error?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'error' as const,
      message,
      details: error
    };
    this.logs.push(entry);
    console.error(`[DEBUG ERROR] ${message}`, error);
    this.notifyListeners();
  }

  static warn(message: string, details?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'warn' as const,
      message,
      details
    };
    this.logs.push(entry);
    console.warn(`[DEBUG WARN] ${message}`, details);
    this.notifyListeners();
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  static subscribe(listener: (logs: typeof DebugLogger.logs) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.logs));
  }
}