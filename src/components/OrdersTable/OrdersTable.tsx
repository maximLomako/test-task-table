import { memo, useMemo, useRef, useState } from 'react';
import {
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography
} from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Order, OrderStatus } from '../../features/orders/types';
import { formatCurrency, formatDateTime } from '../../utils/format';

interface OrdersTableProps {
  orders: Order[];
  onRowClick: (order: Order) => void;
  enableVirtualization?: boolean;
}

type OrderSortKey = 'id' | 'customerName' | 'status' | 'totalAmount' | 'createdAt';

type SortDirection = 'asc' | 'desc';

const columns: { id: OrderSortKey; label: string; align?: 'right' | 'left' }[] = [
  { id: 'id', label: 'Order ID' },
  { id: 'customerName', label: 'Customer Name' },
  { id: 'status', label: 'Status' },
  { id: 'totalAmount', label: 'Total Amount', align: 'right' },
  { id: 'createdAt', label: 'Created Date' }
];

const statusOptions: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

const getSortValue = (order: Order, key: OrderSortKey) => {
  if (key === 'totalAmount') {
    return order.totalAmount;
  }
  if (key === 'createdAt') {
    return new Date(order.createdAt).getTime();
  }
  return order[key];
};

export const OrdersTable = memo(({ orders, onRowClick, enableVirtualization }: OrdersTableProps) => {
  const [orderBy, setOrderBy] = useState<OrderSortKey>('createdAt');
  const [direction, setDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.customerName.toLowerCase().includes(normalizedSearch) ||
        order.id.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      const valueA = getSortValue(a, orderBy);
      const valueB = getSortValue(b, orderBy);
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }
      return String(valueA).localeCompare(String(valueB));
    });
    return direction === 'asc' ? sorted : sorted.reverse();
  }, [direction, filteredOrders, orderBy]);

  const pagedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedOrders.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, sortedOrders]);

  // Virtualization is optional for the current page size, but keeps render costs stable if this grows.
  const rowHeight = 56;
  const shouldVirtualize =
    typeof enableVirtualization === 'boolean' ? enableVirtualization : pagedOrders.length > 25;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? pagedOrders.length : 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 6
  });

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  const handleSort = (column: OrderSortKey) => {
    if (orderBy === column) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setOrderBy(column);
    setDirection('asc');
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Typography variant="h6">Orders Table</Typography>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredOrders.length} orders
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
            <TextField
              label="Search"
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Order ID or customer"
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <InputLabel id="status-filter-label">Status filter</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as OrderStatus | 'all');
                  setPage(0);
                }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === 'all' ? 'All statuses' : status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
        <TableContainer ref={tableContainerRef} sx={{ maxHeight: 520 }}>
          <Table size="small" aria-label="Orders table" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align ?? 'left'}>
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? direction : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!shouldVirtualize &&
                pagedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    tabIndex={0}
                    aria-label={`Open details for ${order.id}`}
                    onClick={() => onRowClick(order)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick(order);
                      }
                    }}
                    sx={{ cursor: 'pointer', height: rowHeight }}
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              {shouldVirtualize && paddingTop > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{ height: `${paddingTop}px`, p: 0, border: 0 }}
                  />
                </TableRow>
              )}
              {shouldVirtualize &&
                virtualRows.map((virtualRow) => {
                  const order = pagedOrders[virtualRow.index];
                  return (
                    <TableRow
                      key={order.id}
                      hover
                      tabIndex={0}
                      aria-label={`Open details for ${order.id}`}
                      onClick={() => onRowClick(order)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(order);
                        }
                      }}
                      sx={{ cursor: 'pointer', height: rowHeight }}
                    >
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              {shouldVirtualize && paddingBottom > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{ height: `${paddingBottom}px`, p: 0, border: 0 }}
                  />
                </TableRow>
              )}
              {pagedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No orders match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedOrders.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Stack>
    </Paper>
  );
});
