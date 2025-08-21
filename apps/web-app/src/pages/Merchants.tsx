import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantService, regionService } from '../services/api';

const Merchants: React.FC = () => {
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    regionId: '',
    commissionRate: 0.05,
  });

  const queryClient = useQueryClient();

  const { data: merchantsData, isLoading } = useQuery({
    queryKey: ['merchants', page],
    queryFn: () => merchantService.getAll(page, 10),
  });

  const { data: regionsData } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const createMerchantMutation = useMutation({
    mutationFn: merchantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      setOpenDialog(false);
      setFormData({ name: '', regionId: '', commissionRate: 0.05 });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      merchantService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
    },
  });

  const handleSubmit = () => {
    createMerchantMutation.mutate(formData);
  };

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Merchants
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Merchant
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Commission Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merchantsData?.data?.map((merchant: any) => (
              <TableRow key={merchant.id}>
                <TableCell>{merchant.name}</TableCell>
                <TableCell>{merchant.regionName}</TableCell>
                <TableCell>{(merchant.commissionRate * 100).toFixed(2)}%</TableCell>
                <TableCell>
                  <Chip
                    label={merchant.status}
                    color={getStatusColor(merchant.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(merchant.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(merchant.id, merchant.status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {merchant.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {merchantsData?.pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={merchantsData.pagination.totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Merchant</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Merchant Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Region</InputLabel>
            <Select
              value={formData.regionId}
              onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
            >
              {regionsData?.data?.map((region: any) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Commission Rate"
            type="number"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
            margin="normal"
            inputProps={{ min: 0, max: 1, step: 0.01 }}
            helperText="Enter as decimal (e.g., 0.05 for 5%)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMerchantMutation.isPending}
          >
            {createMerchantMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Merchants;