export const sample = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number, digits = 2): number => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(digits));
};

export const randomDateWithinDays = (days: number): Date => {
  const now = Date.now();
  const offset = randomInt(0, days) * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
};

export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};
