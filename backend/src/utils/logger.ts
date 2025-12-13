type LogFn = (message: string, meta?: unknown) => void;

function log(prefix: string, message: string, meta?: unknown): void {
  if (meta === undefined) {
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${message}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`${prefix} ${message}`, meta);
}

export const logger: { info: LogFn; warn: LogFn; error: LogFn } = {
  info: (message, meta) => log("[INFO]", message, meta),
  warn: (message, meta) => log("[WARN]", message, meta),
  error: (message, meta) => log("[ERROR]", message, meta),
};

