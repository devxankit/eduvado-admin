import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/admin/users`);
      const usersWithId = response.data.map(user => ({
        ...user,
        id: user._id,
        createdAt: user.createdAt || new Date().toISOString()
      }));
      setUsers(usersWithId);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    try {
      await axios.put(`${config.API_URL}/admin/users/${selectedUser._id}/role`, {
        role,
      });
      toast.success('User role updated successfully');
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedUser(params.row);
            setRole(params.row.role);
            setOpenDialog(true);
          }}
        >
          {params.row.role}
        </Button>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
      valueGetter: (params) => {
        try {
          return params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : 'N/A';
        } catch (error) {
          return 'N/A';
        }
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        disableSelectionOnClick
        loading={loading}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleRoleChange} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 