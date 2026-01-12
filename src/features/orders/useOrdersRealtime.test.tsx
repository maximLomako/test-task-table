import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';
import { useOrdersRealtime } from './useOrders';
import type { MockWebSocketMessage } from './types';

class FakeSocket {
  onopen?: () => void;
  onclose?: () => void;
  onmessage?: (event: { data: string }) => void;
  onerror?: () => void;
  connectCalls = 0;

  connect() {
    this.connectCalls += 1;
    this.onopen?.();
  }

  close(_code?: number, _reason?: string) {
    this.onclose?.();
  }

  simulateDrop() {
    this.onclose?.();
  }

  emitMessage(message: MockWebSocketMessage) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

const RealtimeStatus = ({ createSocket }: { createSocket: (cb: () => MockWebSocketMessage) => FakeSocket }) => {
  const { status } = useOrdersRealtime({ createSocket });
  return <div>{status}</div>;
};

describe('useOrdersRealtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reconnects after a drop with backoff', async () => {
    const client = new QueryClient();
    let socket: FakeSocket | null = null;

    const createSocket = (cb: () => MockWebSocketMessage) => {
      socket = new FakeSocket();
      socket.onmessage = () => {
        cb();
      };
      return socket;
    };

    render(
      <QueryClientProvider client={client}>
        <RealtimeStatus createSocket={createSocket} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Connected')).toBeInTheDocument();

    act(() => {
      socket?.simulateDrop();
    });

    expect(screen.getByText('Reconnecting')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});
