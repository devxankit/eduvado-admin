import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Clock,
  DollarSign,
  Tag,
  RefreshCw,
  Settings,
  Palette,
  ArrowRight,
  Filter,
  Star,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    level: '',
    isActive: '',
    isFeatured: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    durationNumber: '',
    durationUnit: 'months',
    image: '',
    instructor: '',
    level: 'Beginner',
    tags: [],
    prerequisites: [],
    learningOutcomes: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(filters.level && { level: filters.level }),
        ...(filters.isActive !== '' && { isActive: filters.isActive }),
        ...(filters.isFeatured !== '' && { isFeatured: filters.isFeatured })
      });
      
      const response = await axios.get(`${config.apiUrl}/admin/courses?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCourses(response.data.courses);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error(response.data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.apiUrl}/admin/courseCategories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        console.log('Categories loaded:', response.data.categories);
        setCategories(response.data.categories);
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch categories');
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [currentPage, sortBy, sortOrder, searchTerm, filterCategory, filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Course title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Course title must be at least 3 characters long';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Course description is required';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Course description must be at least 20 characters long';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category. Create categories first in the Categories page if none are available.';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Please enter a valid price';
    }
    
    if (!formData.durationNumber || !formData.durationUnit) {
      errors.duration = 'Course duration is required';
    } else if (parseInt(formData.durationNumber) < 1) {
      errors.duration = 'Duration must be at least 1';
    }
    
    if (!formData.image.trim()) {
      errors.image = 'Course image URL is required';
    } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.image)) {
      errors.image = 'Please enter a valid image URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const submitData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: `${formData.durationNumber} ${formData.durationUnit}`,
        image: formData.image.trim(),
        instructor: formData.instructor?.trim(),
        price: parseFloat(formData.price)
      };

      // Remove the separate duration fields from the data sent to backend
      delete submitData.durationNumber;
      delete submitData.durationUnit;


      if (selectedCourse) {
        const response = await axios.put(
          `${config.apiUrl}/admin/courses/${selectedCourse._id}`,
          submitData,
          { headers }
        );
        
        if (response.data.success) {
          toast.success('Course updated successfully');
        } else {
          throw new Error(response.data.message);
        }
      } else {
        const response = await axios.post(`${config.apiUrl}/admin/courses`, submitData, { headers });
        
        if (response.data.success) {
          toast.success('Course created successfully');
        } else {
          throw new Error(response.data.message);
        }
      }
      
      setOpenDialog(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors) {
          setFormErrors(errorData.errors.reduce((acc, err) => ({ ...acc, [err.field]: err.message }), {}));
        } else {
          toast.error(errorData.message || 'Validation error');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to save course');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      durationNumber: '',
      durationUnit: 'months',
      image: '',
      instructor: '',
      level: 'Beginner',
      tags: [],
      prerequisites: [],
      learningOutcomes: []
    });
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${config.apiUrl}/admin/courses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          toast.success('Course deleted successfully');
          fetchCourses();
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Failed to delete course:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error(error.response?.data?.message || 'Failed to delete course');
        }
      }
    }
  };

  const handleEdit = (course) => {
    // Parse existing duration
    let durationNumber = '';
    let durationUnit = 'months';
    
    if (course.duration) {
      const durationMatch = course.duration.match(/^(\d+)\s*(days?|weeks?|months?|years?|hours?)$/i);
      if (durationMatch) {
        durationNumber = durationMatch[1];
        durationUnit = durationMatch[2].toLowerCase();
        // Normalize unit names
        if (durationUnit.endsWith('s')) {
          durationUnit = durationUnit.slice(0, -1);
        }
      }
    }
    
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: typeof course.category === 'object' && course.category?._id ? course.category._id : course.category,
      price: course.price,
      duration: course.duration,
      durationNumber,
      durationUnit,
      image: course.image,
      instructor: course.instructor || '',
      level: course.level || 'Beginner',
      tags: course.tags || [],
      prerequisites: course.prerequisites || [],
      learningOutcomes: course.learningOutcomes || []
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${config.apiUrl}/admin/courses/${id}/toggle`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCourses();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to toggle course status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to toggle course status');
      }
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${config.apiUrl}/admin/courses/${id}/feature`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCourses();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to toggle course featured status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to toggle course featured status');
      }
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setOpenDialog(true);
  };


  const getCategoryBadgeVariant = (category) => {
    if (typeof category === 'object' && category?.color) {
      return `text-white border-0`;
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryColor = (category) => {
    if (typeof category === 'object' && category?.color) {
      return category.color;
    }
    return '#6B7280';
  };

  const getCategoryName = (category) => {
    if (typeof category === 'object' && category?.name) {
      return category.name;
    }
    return 'Unknown';
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-orange-100 text-orange-800',
      'Expert': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const iconOptions = [
    'BookOpen', 'GraduationCap', 'Laptop', 'Code', 'Calculator', 
    'Microscope', 'Atom', 'Dna', 'FlaskConical', 'Brain',
    'Lightbulb', 'Target', 'Trophy', 'Star', 'Award', 'Users',
    'Book', 'PenTool', 'Layers', 'Puzzle', 'Rocket'
  ];

  const levelOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'price', label: 'Price' },
    { value: 'enrollmentCount', label: 'Enrollments' },
    { value: 'rating', label: 'Rating' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600 mt-1">Manage your educational courses and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchCourses} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/admin/categories', '_blank')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
          <Button 
            onClick={handleCreateNew} 
            disabled={categoriesLoading || categories.length === 0}
            title={categoriesLoading ? 'Loading categories...' : categories.length === 0 ? 'Create categories first in the Categories page' : 'Add a new course'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 border rounded-lg bg-gray-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select.Root value={filterCategory} onValueChange={setFilterCategory}>
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="All Categories" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content>
                    <Select.Viewport className="p-1">
                      <Select.Item value="all">
                        <Select.ItemText>All Categories</Select.ItemText>
                      </Select.Item>
                      {categories.map((category) => (
                        <Select.Item key={category._id} value={category._id}>
                          <Select.ItemText>{category.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            
            <div className="space-y-2">
              <Label>Level</Label>
              <Select.Root value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="All Levels" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content>
                    <Select.Viewport className="p-1">
                      <Select.Item value="">
                        <Select.ItemText>All Levels</Select.ItemText>
                      </Select.Item>
                      {levelOptions.map((level) => (
                        <Select.Item key={level.value} value={level.value}>
                          <Select.ItemText>{level.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select.Root value={filters.isActive} onValueChange={(value) => setFilters({...filters, isActive: value})}>
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="All Status" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content>
                    <Select.Viewport className="p-1">
                      <Select.Item value="">
                        <Select.ItemText>All Status</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="true">
                        <Select.ItemText>Active</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="false">
                        <Select.ItemText>Inactive</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            
            <div className="space-y-2">
              <Label>Featured</Label>
              <Select.Root value={filters.isFeatured} onValueChange={(value) => setFilters({...filters, isFeatured: value})}>
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="All Featured" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content>
                    <Select.Viewport className="p-1">
                      <Select.Item value="">
                        <Select.ItemText>All Featured</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="true">
                        <Select.ItemText>Featured</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="false">
                        <Select.ItemText>Not Featured</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Courses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {courses.filter(c => c.isFeatured).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-orange-600">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Tag className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Sort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses by title, description, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Select.Root value={sortBy} onValueChange={setSortBy}>
            <Select.Trigger className="w-40">
              <Select.Value placeholder="Sort by" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content>
                <Select.Viewport className="p-1">
                  {sortOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Courses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Courses ({courses.length})</CardTitle>
            <CardDescription>
              Manage your educational courses and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={viewMode === 'grid' ? 'p-4 border rounded-lg' : 'flex items-center space-x-4 p-4 border rounded-lg'}>
                    <div className={viewMode === 'grid' ? 'h-48 w-full bg-gray-200 rounded-lg animate-pulse mb-4' : 'h-12 w-12 bg-gray-200 rounded-lg animate-pulse'} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {courses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={viewMode === 'grid' 
                      ? 'p-4 border rounded-lg hover:shadow-md transition-all duration-200' 
                      : 'flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                    }
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <>
                        <div className="relative mb-4">
                          <Avatar className="h-48 w-full rounded-lg">
                            <AvatarImage src={course.image} alt={course.title} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white h-48">
                              <BookOpen className="h-12 w-12" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute top-2 right-2 flex space-x-1">
                            {course.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge className={course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {course.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeVariant(course.category)}`}
                              style={{ backgroundColor: getCategoryColor(course.category) }}
                            >
                              {getCategoryName(course.category)}
                            </div>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">{formatPrice(course.price)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                          
                          {course.instructor && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>{course.instructor}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(course._id, course.isActive)}
                                className={course.isActive ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}
                              >
                                {course.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFeatured(course._id, course.isFeatured)}
                                className={course.isFeatured ? "text-yellow-600 hover:text-yellow-700" : "text-gray-400 hover:text-gray-600"}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(course)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(course._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // List View
                      <>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={course.image} alt={course.title} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              <BookOpen className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">{course.title}</h3>
                              {course.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeVariant(course.category)}`}
                                style={{ backgroundColor: getCategoryColor(course.category) }}
                              >
                                {getCategoryName(course.category)}
                              </div>
                              <Badge className={getLevelColor(course.level)}>
                                {course.level}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <DollarSign className="h-3 w-3" />
                                <span>{formatPrice(course.price)}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{course.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(course._id, course.isActive)}
                            className={course.isActive ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}
                          >
                            {course.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(course._id, course.isFeatured)}
                            className={course.isFeatured ? "text-yellow-600 hover:text-yellow-700" : "text-gray-400 hover:text-gray-600"}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(course._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
                
                {courses.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-500 mb-4">
                      {categories.length === 0 
                        ? 'Create categories first, then add courses.' 
                        : 'Try adjusting your search or filter criteria.'
                      }
                    </p>
                    <div className="flex justify-center space-x-3">
                      {!categoriesLoading && categories.length === 0 && (
                        <Button 
                          variant="outline" 
                          onClick={() => window.open('/admin/categories', '_blank')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Create Categories First
                        </Button>
                      )}
                      <Button onClick={handleCreateNew} disabled={categoriesLoading || categories.length === 0}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Course
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Dialog */}
      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div>
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {selectedCourse ? 'Edit Course' : 'Add New Course'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {selectedCourse ? 'Update course information' : 'Create a new course'}
              </Dialog.Description>
            </div>
           
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter course title"
                      className={formErrors.title ? 'border-red-500' : ''}
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Enter instructor name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter course description"
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.description ? 'border-red-500' : ''}`}
                    rows={4}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Category and Level */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Category & Level</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    {categoriesLoading ? (
                      <div className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm flex items-center text-gray-500">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="w-full p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
                        <Tag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No categories available</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Please create categories first in the Categories page
                        </p>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => window.open('/admin/categories', '_blank')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Go to Categories
                        </Button>
                      </div>
                    ) : (
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.category ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {formErrors.category && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.category}
                      </p>
                    )}
                    {!categoriesLoading && categories.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} available
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select.Root value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder="Select level" />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content>
                          <Select.Viewport className="p-1">
                            {levelOptions.map((level) => (
                              <Select.Item key={level.value} value={level.value}>
                                <Select.ItemText>{level.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </div>
              </div>

              {/* Pricing and Duration */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Pricing & Duration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      min="0"
                      className={formErrors.price ? 'border-red-500' : ''}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.price}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="durationNumber"
                        type="number"
                        value={formData.durationNumber || ''}
                        onChange={(e) => setFormData({ ...formData, durationNumber: e.target.value })}
                        placeholder="12"
                        className={`flex-1 ${formErrors.duration ? 'border-red-500' : ''}`}
                        min="1"
                      />
                      <Select.Root 
                        value={formData.durationUnit || 'months'} 
                        onValueChange={(value) => setFormData({ ...formData, durationUnit: value })}
                      >
                        <Select.Trigger className="w-32">
                          <Select.Value placeholder="Unit" />
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content>
                            <Select.Viewport className="p-1">
                              <Select.Item value="days">
                                <Select.ItemText>days</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="weeks">
                                <Select.ItemText>weeks</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="months">
                                <Select.ItemText>months</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="years">
                                <Select.ItemText>years</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="hours">
                                <Select.ItemText>hours</Select.ItemText>
                              </Select.Item>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </div>
                    {formErrors.duration && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Media</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className={formErrors.image ? 'border-red-500' : ''}
                  />
                  {formErrors.image && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.image}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP</p>
                </div>
              </div>
            </div>
          
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {selectedCourse ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {selectedCourse ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
};

export default Courses; 