export const logger = {
  info: (service: string, method: string, message?: string) => {
    console.log(`[${service}:${method}] ${message || ""}`);
  },
  error: (service: string, method: string, error: any) => {
    console.error(`[${service}:${method}] ERROR:`, error);
  },
};
