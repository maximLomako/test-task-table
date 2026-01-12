import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderDetailsModal } from './OrderDetailsModal';
import type { Order } from '../../features/orders/types';
import { vi } from 'vitest';

const order: Order = {
  id: 'ORD-9999',
  customerName: 'Robin Hall',
  customerEmail: 'robin@mail.com',
  status: 'pending',
  items: [
    {
      id: 'item-1',
      productName: 'Desk Lamp',
      quantity: 2,
      price: 40
    }
  ],
  totalAmount: 80,
  currency: 'USD',
  createdAt: new Date('2024-06-01T10:00:00Z').toISOString(),
  updatedAt: new Date('2024-06-01T12:00:00Z').toISOString(),
  shippingAddress: {
    street: '1 Main St',
    city: 'Austin',
    country: 'USA',
    postalCode: '73301'
  }
};

describe('OrderDetailsModal', () => {
  it('updates status and calls onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(() => Promise.resolve());
    const onClose = vi.fn();

    render(
      <OrderDetailsModal
        order={order}
        open
        onClose={onClose}
        onSave={onSave}
        saving={false}
      />
    );

    await user.click(screen.getByLabelText('Order Status'));
    await user.click(screen.getByRole('option', { name: 'processing' }));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(onSave).toHaveBeenCalledWith('ORD-9999', 'processing');
  });
});
