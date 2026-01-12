import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { OrdersTable } from './OrdersTable';
import type { Order } from '../../features/orders/types';

const baseOrder = (overrides: Partial<Order>): Order => ({
  id: 'ORD-0001',
  customerName: 'Alex Doe',
  customerEmail: 'alex@mail.com',
  status: 'pending',
  items: [
    {
      id: 'item-1',
      productName: 'Desk Lamp',
      quantity: 1,
      price: 25
    }
  ],
  totalAmount: 25,
  currency: 'USD',
  createdAt: new Date('2024-06-01T10:00:00Z').toISOString(),
  updatedAt: new Date('2024-06-01T12:00:00Z').toISOString(),
  shippingAddress: {
    street: '1 Main St',
    city: 'Austin',
    country: 'USA',
    postalCode: '73301'
  },
  ...overrides
});

describe('OrdersTable', () => {
  it('renders orders with basic columns', () => {
    const orders = [
      baseOrder({ id: 'ORD-0001', customerName: 'Alex Doe' }),
      baseOrder({ id: 'ORD-0002', customerName: 'Jamie Ray' })
    ];

    render(<OrdersTable orders={orders} onRowClick={() => {}} enableVirtualization={false} />);

    expect(screen.getByText('Orders Table')).toBeInTheDocument();
    expect(screen.getByText('ORD-0001')).toBeInTheDocument();
    expect(screen.getByText('Jamie Ray')).toBeInTheDocument();
  });

  it('filters by status and sorts by total amount', async () => {
    const user = userEvent.setup();
    const orders = [
      baseOrder({ id: 'ORD-0001', status: 'pending', totalAmount: 100 }),
      baseOrder({ id: 'ORD-0002', status: 'processing', totalAmount: 60 }),
      baseOrder({ id: 'ORD-0003', status: 'pending', totalAmount: 180 })
    ];

    render(<OrdersTable orders={orders} onRowClick={() => {}} enableVirtualization={false} />);

    await user.click(screen.getByLabelText('Status filter'));
    await user.click(screen.getByRole('option', { name: 'pending' }));

    expect(screen.getByText('ORD-0001')).toBeInTheDocument();
    expect(screen.queryByText('ORD-0002')).not.toBeInTheDocument();
    expect(screen.getByText('ORD-0003')).toBeInTheDocument();

    await user.click(screen.getByText('Total Amount'));

    const rows = screen.getAllByRole('row');
    const bodyRows = rows.slice(1);
    const firstRowCells = within(bodyRows[0]).getAllByRole('cell');
    expect(firstRowCells[0]).toHaveTextContent('ORD-0001');
  });

  it('opens details from keyboard', async () => {
    const user = userEvent.setup();
    const orders = [baseOrder({ id: 'ORD-0101' })];
    const onRowClick = vi.fn();

    render(<OrdersTable orders={orders} onRowClick={onRowClick} enableVirtualization={false} />);

    const row = screen.getByRole('row', { name: /open details for ord-0101/i });
    row.focus();
    await user.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledWith(orders[0]);
  });

  it('filters by search text', async () => {
    const user = userEvent.setup();
    const orders = [
      baseOrder({ id: 'ORD-0201', customerName: 'Taylor Swift' }),
      baseOrder({ id: 'ORD-0202', customerName: 'Jordan Peele' })
    ];

    render(<OrdersTable orders={orders} onRowClick={() => {}} enableVirtualization={false} />);

    await user.type(screen.getByLabelText('Search'), 'Taylor');

    expect(screen.getByText('ORD-0201')).toBeInTheDocument();
    expect(screen.queryByText('ORD-0202')).not.toBeInTheDocument();
  });
});
