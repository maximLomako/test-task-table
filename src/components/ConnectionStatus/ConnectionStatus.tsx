import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { ConnectionStatus } from '../../features/orders/useOrders';

interface ConnectionStatusProps {
  status: ConnectionStatus;
}

const statusColor: Record<ConnectionStatus, 'success' | 'warning' | 'default'> = {
  Connected: 'success',
  Reconnecting: 'warning',
  Disconnected: 'default'
};

export const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  return (
    <Box role="status" aria-live="polite">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle1" color="text.secondary">
          Live Updates
        </Typography>
        <Chip
          icon={<FiberManualRecordIcon />}
          label={status}
          color={statusColor[status]}
          variant="outlined"
          size="small"
        />
      </Stack>
    </Box>
  );
};
