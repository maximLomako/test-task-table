import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMockOrder, generateMockOrders, pickNextStatus } from './mockData';
import type { MockWebSocketMessage, Order, OrderStatusUpdate } from './types';
import { MockWebSocket } from '../../services/mockWebSocket';

export const ordersQueryKey = ['orders'] as const;
const seedOrders = generateMockOrders(80);

export type ConnectionStatus = 'Connected' | 'Disconnected' | 'Reconnecting';

export const useOrders = () => {
  return useQuery<Order[]>({
    queryKey: ordersQueryKey,
    queryFn: async () => seedOrders,
    initialData: seedOrders,
    staleTime: Infinity
  });
};

interface StatusMutationInput {
  id: string;
  status: Order['status'];
}

const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const updateOrdersCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (orders: Order[]) => Order[]
) => {
  queryClient.setQueryData<Order[]>(ordersQueryKey, (orders = []) => updater(orders));
};

const applyStatusUpdate = (order: Order, update: OrderStatusUpdate) => {
  if (order.id !== update.id) {
    return order;
  }
  return {
    ...order,
    status: update.status,
    updatedAt: update.updatedAt
  };
};

export const useOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: StatusMutationInput) => {
      await pause(350);
      return { id, status };
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ordersQueryKey });
      const previous = queryClient.getQueryData<Order[]>(ordersQueryKey);
      const updatedAt = new Date().toISOString();
      updateOrdersCache(queryClient, (orders) =>
        orders.map((order) =>
          applyStatusUpdate(order, {
            id,
            status,
            updatedAt
          })
        )
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ordersQueryKey, context.previous);
      }
    }
  });
};

const parseOrderNumber = (id: string): number => {
  const match = id.match(/ORD-(\d+)/);
  return match ? Number(match[1]) : 0;
};

const getNextOrderNumber = (orders: Order[]): number => {
  return orders.reduce((max, order) => Math.max(max, parseOrderNumber(order.id)), 0) + 1;
};

const createStatusUpdate = (orders: Order[]): MockWebSocketMessage => {
  const order = orders[Math.floor(Math.random() * orders.length)];
  return {
    type: 'order_status',
    payload: {
      id: order.id,
      status: pickNextStatus(order.status),
      updatedAt: new Date().toISOString()
    }
  };
};

const createNewOrder = (orders: Order[]): MockWebSocketMessage => {
  const nextNumber = getNextOrderNumber(orders);
  return {
    type: 'new_order',
    payload: createMockOrder(nextNumber)
  };
};

const createSocketMessage = (orders: Order[]): MockWebSocketMessage => {
  if (orders.length === 0) {
    return createNewOrder(orders);
  }
  return Math.random() > 0.45 ? createStatusUpdate(orders) : createNewOrder(orders);
};

interface UseOrdersRealtimeOptions {
  createSocket?: (createMessage: () => MockWebSocketMessage) => MockWebSocket;
}

export const useOrdersRealtime = (options: UseOrdersRealtimeOptions = {}) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>('Disconnected');
  const retryRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const cleanupRef = useRef(false);
  const createSocket = options.createSocket;

  const createMessage = useCallback(() => {
    const orders = queryClient.getQueryData<Order[]>(ordersQueryKey) ?? [];
    return createSocketMessage(orders);
  }, [queryClient]);

  useEffect(() => {
    cleanupRef.current = false;

    const socket = createSocket
      ? createSocket(createMessage)
      : new MockWebSocket({ createMessage });

    const connect = () => {
      socket.connect();
    };

    socket.onopen = () => {
      retryRef.current = 0;
      setStatus('Connected');
    };

    socket.onmessage = (event) => {
      let parsed: MockWebSocketMessage;
      try {
        parsed = JSON.parse(event.data) as MockWebSocketMessage;
      } catch {
        return;
      }
      if (parsed.type === 'new_order') {
        updateOrdersCache(queryClient, (orders) => [parsed.payload, ...orders]);
        return;
      }
      if (parsed.type === 'order_status') {
        updateOrdersCache(queryClient, (orders) =>
          orders.map((order) => applyStatusUpdate(order, parsed.payload))
        );
      }
    };

    socket.onclose = () => {
      if (cleanupRef.current) {
        return;
      }
      setStatus('Reconnecting');
      const attempt = retryRef.current + 1;
      retryRef.current = attempt;
      const delay = Math.min(1000 * 2 ** attempt, 15000);
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    socket.onerror = () => {
      setStatus('Reconnecting');
    };

    connect();

    return () => {
      cleanupRef.current = true;
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      socket.close(1000, 'Unmount');
      setStatus('Disconnected');
    };
  }, [createMessage, createSocket, queryClient]);

  return { status };
};
