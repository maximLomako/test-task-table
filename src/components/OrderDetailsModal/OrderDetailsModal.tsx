import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import type { Order, OrderStatus } from '../../features/orders/types';
import { formatCurrency } from '../../utils/format';

const schema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
});

type FormValues = z.infer<typeof schema>;

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSave: (orderId: string, status: OrderStatus) => Promise<void>;
  saving: boolean;
}

export const OrderDetailsModal = ({ order, open, onClose, onSave, saving }: OrderDetailsModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: order?.status ?? 'pending'
    }
  });

  useEffect(() => {
    if (!order) {
      return;
    }
    reset({ status: order.status });
  }, [order, reset]);

  if (!order) {
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    await onSave(order.id, values.status);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Order {order.id}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">Customer</Typography>
            <Typography>{order.customerName}</Typography>
            <Typography color="text.secondary">{order.customerEmail}</Typography>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant="subtitle1">Shipping Address</Typography>
            <Typography>{order.shippingAddress.street}</Typography>
            <Typography>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </Typography>
            <Typography>{order.shippingAddress.country}</Typography>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant="subtitle1">Items</Typography>
            {order.items.map((item) => (
              <Stack key={item.id} direction="row" justifyContent="space-between">
                <Typography>
                  {item.productName} x{item.quantity}
                </Typography>
                <Typography color="text.secondary">
                  {formatCurrency(item.price * item.quantity, order.currency)}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Order Status" {...field} fullWidth>
                  {schema.shape.status.options.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h6">
                {formatCurrency(order.totalAmount, order.currency)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
