import { Box, Card, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { fShortenNumber } from '../../../utils/format-number';

type Props = {
  title: string;
  total: number;
  icon: Element | JSX.Element;
  color: string;
};
export function WidgetSummary({
  title,
  total,
  icon,
  color = 'primary',
}: Props) {
  return (
    <Card
      component={Stack}
      spacing={3}
      direction="row"
      sx={{
        px: 3,
        py: 5,
        borderRadius: 2,
      }}
    >
      {icon && <Box sx={{ width: 64, height: 64 }}>{icon}</Box>}

      <Stack spacing={0.5}>
        <Typography variant="h4">{fShortenNumber(total)}</Typography>

        <Typography variant="subtitle2" sx={{ color: `text.${color}` }}>
          {title}
        </Typography>
      </Stack>
    </Card>
  );
}
