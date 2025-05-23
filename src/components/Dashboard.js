import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, coursesResponse] = await Promise.all([
          axios.get(`${config.API_URL}/admin/users`),
          axios.get(`${config.API_URL}/admin/courses`),
        ]);

        setStats({
          totalUsers: usersResponse.data.length,
          totalCourses: coursesResponse.data.length,
        });
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics');
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h3">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Courses
            </Typography>
            <Typography variant="h3">{stats.totalCourses}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 