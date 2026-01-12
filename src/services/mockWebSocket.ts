import type { MockWebSocketMessage } from '../features/orders/types';

export type MockWebSocketStatus = 'connecting' | 'open' | 'closed';

export interface MockWebSocketOptions {
  minIntervalMs?: number;
  maxIntervalMs?: number;
  dropChance?: number;
  createMessage: () => MockWebSocketMessage;
}

export interface MockCloseEvent {
  code: number;
  reason: string;
}

export class MockWebSocket {
  private messageTimeoutId: number | null = null;
  private dropTimeoutId: number | null = null;
  private status: MockWebSocketStatus = 'closed';
  private readonly minIntervalMs: number;
  private readonly maxIntervalMs: number;
  private readonly dropChance: number;
  private readonly createMessage: () => MockWebSocketMessage;

  onopen?: () => void;
  onmessage?: (event: { data: string }) => void;
  onclose?: (event: MockCloseEvent) => void;
  onerror?: (error: Error) => void;

  constructor(options: MockWebSocketOptions) {
    this.minIntervalMs = options.minIntervalMs ?? 3000;
    this.maxIntervalMs = options.maxIntervalMs ?? 5000;
    this.dropChance = options.dropChance ?? 0.12;
    this.createMessage = options.createMessage;
  }

  connect(): void {
    if (this.status === 'open' || this.status === 'connecting') {
      return;
    }
    this.status = 'connecting';
    this.emitOpen();
    this.scheduleNextMessage();
    this.scheduleDropCheck();
  }

  close(code = 1000, reason = 'Closed by client'): void {
    if (this.status === 'closed') {
      return;
    }
    this.clearTimers();
    this.status = 'closed';
    this.onclose?.({ code, reason });
  }

  simulateDrop(): void {
    this.close(1006, 'Simulated connection drop');
  }

  private emitOpen(): void {
    this.status = 'open';
    this.onopen?.();
  }

  private scheduleNextMessage(): void {
    const delay = this.randomBetween(this.minIntervalMs, this.maxIntervalMs);
    this.messageTimeoutId = window.setTimeout(() => {
      if (this.status !== 'open') {
        return;
      }
      try {
        const message = this.createMessage();
        this.onmessage?.({ data: JSON.stringify(message) });
      } catch (error) {
        this.onerror?.(error instanceof Error ? error : new Error('MockWebSocket error'));
      }
      this.scheduleNextMessage();
    }, delay);
  }

  private scheduleDropCheck(): void {
    const delay = this.randomBetween(6000, 12000);
    this.dropTimeoutId = window.setTimeout(() => {
      if (this.status !== 'open') {
        return;
      }
      if (Math.random() < this.dropChance) {
        this.close(1006, 'Simulated network drop');
        return;
      }
      this.scheduleDropCheck();
    }, delay);
  }

  private clearTimers(): void {
    if (this.messageTimeoutId !== null) {
      window.clearTimeout(this.messageTimeoutId);
      this.messageTimeoutId = null;
    }
    if (this.dropTimeoutId !== null) {
      window.clearTimeout(this.dropTimeoutId);
      this.dropTimeoutId = null;
    }
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
