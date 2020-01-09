export default (ms: number): Promise<void> => new Promise(
  (resolve): NodeJS.Timeout => setTimeout(resolve, ms),
);
