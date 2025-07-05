// cron-runner service

export class CronRunnerService {
  private static instance: CronRunnerService;

  private constructor() {}

  static getInstance(): CronRunnerService {
    if (!CronRunnerService.instance) {
      CronRunnerService.instance = new CronRunnerService();
    }
    return CronRunnerService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize service
  }

  async execute(params: any): Promise<any> {
    // Execute service logic
    return { success: true, data: params };
  }
}

// Export both named and default exports
export const cronRunner = CronRunnerService.getInstance();
export const getCronRunner = () => cronRunner;
export default cronRunner;
