export const logger = {
  info: (service: string, method: string, message?: string) => {
    console.log(`\n[${service}:${method}] ${message || ""}\n`);
  },
  error: (service: string, method: string, error: any) => {
    console.error(`\n[${service}:${method}] ERROR:\n`, error);
  },
};
