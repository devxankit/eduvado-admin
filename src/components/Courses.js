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
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    image: '',
  });

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/admin/courses`);
      const coursesWithId = response.data.map(course => ({
        ...course,
        id: course._id
      }));
      setCourses(coursesWithId);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch courses');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedCourse) {
        await axios.put(
          `${config.API_URL}/admin/courses/${selectedCourse._id}`,
          formData
        );
        toast.success('Course updated successfully');
      } else {
        await axios.post(`${config.API_URL}/admin/courses`, formData);
        toast.success('Course created successfully');
      }
      setOpenDialog(false);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to save course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${config.API_URL}/admin/courses/${id}`);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      duration: course.duration,
      image: course.image,
    });
    setOpenDialog(true);
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'price', headerName: 'Price', width: 130 },
    { field: 'duration', headerName: 'Duration', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Courses Management</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedCourse(null);
            setFormData({
              title: '',
              description: '',
              category: '',
              price: '',
              duration: '',
              image: '',
            });
            setOpenDialog(true);
          }}
        >
          Add New Course
        </Button>
      </Box>

      <DataGrid
        rows={courses}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        disableSelectionOnClick
        loading={loading}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            margin="normal"
          >
            <MenuItem value="JEE">JEE</MenuItem>
            <MenuItem value="NEET">NEET</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Duration"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Image URL"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCourse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Courses; 