import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  Store,
  AccountBalance,
  People,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { merchantService, transactionService } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: merchantsData } = useQuery({
    queryKey: ['merchants'],
    queryFn: () => merchantService.getAll(),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(),
  });

  const stats = [
    {
      title: 'Total Merchants',
      value: merchantsData?.pagination?.total || 0,
      icon: <Store fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Total Transactions',
      value: transactionsData?.pagination?.total || 0,
      icon: <TrendingUp fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Active Merchants',
      value: merchantsData?.data?.filter((m: any) => m.status === 'active').length || 0,
      icon: <People fontSize="large" />,
      color: '#ed6c02',
    },
    {
      title: 'Revenue',
      value: '0',
      icon: <AccountBalance fontSize="large" />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      color: 'white',
                      borderRadius: 1,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Merchants
            </Typography>
            {merchantsData?.data?.slice(0, 5).map((merchant: any) => (
              <Box key={merchant.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body1">{merchant.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {merchant.regionName} • {merchant.status}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            {transactionsData?.data?.slice(0, 5).map((transaction: any) => (
              <Box key={transaction.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body1">
                  ${transaction.amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cashback: ${transaction.cashbackAmount.toFixed(2)} • {transaction.status}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;