import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ThemeProvider } from '@mui/material/styles';
import { buildTheme } from './theme/theme';
import { OrdersTable } from './components/OrdersTable/OrdersTable';
import { OrderDetailsModal } from './components/OrderDetailsModal/OrderDetailsModal';
import { ConnectionStatusIndicator } from './components/ConnectionStatus/ConnectionStatus';
import { useOrderStatusMutation, useOrders, useOrdersRealtime } from './features/orders/useOrders';
import type { Order } from './features/orders/types';

export const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const { data: orders = [] } = useOrders();
  const { mutateAsync: saveStatus, isPending } = useOrderStatusMutation();
  const { status } = useOrdersRealtime();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const handleSave = useCallback(async (orderId: string, nextStatus: Order['status']) => {
    await saveStatus({ id: orderId, status: nextStatus });
  }, [saveStatus]);

  const handleRowClick = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h4" gutterBottom>
                  Orders Dashboard
                </Typography>
                <Typography color="text.secondary">
                  Real-time visibility into the latest ecommerce orders.
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <ConnectionStatusIndicator status={status} />
                <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                  <IconButton onClick={toggleMode}>
                    {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <OrdersTable orders={orders} onRowClick={handleRowClick} />
          </Stack>
        </Container>
      </Box>
      <OrderDetailsModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        onSave={handleSave}
        saving={isPending}
      />
    </ThemeProvider>
  );
};
