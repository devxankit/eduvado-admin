import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import axios from 'axios';
import config from '../config/config';
import {
  CreditCard,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  RefreshCw,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [paymentStats, setPaymentStats] = useState({});
  
  // Dialog states
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [openTrialDialog, setOpenTrialDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [planFormData, setPlanFormData] = useState({
    planType: '',
    description: '',
    price: ''
  });
  const [trialFormData, setTrialFormData] = useState({
    action: 'extend',
    days: 3
  });
  
  // Edit states
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all data in parallel
      const [
        plansResponse,
        userSubsResponse,
        paymentsResponse,
        analyticsResponse,
        paymentStatsResponse
      ] = await Promise.all([
        axios.get(`${config.apiUrl}/admin/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/admin/user-subscriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/admin/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/admin/subscription-analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/admin/payment-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSubscriptionPlans(plansResponse.data);
      setUserSubscriptions(userSubsResponse.data.subscriptions || []);
      setPayments(paymentsResponse.data.payments || []);
      setAnalytics(analyticsResponse.data.analytics || {});
      setPaymentStats(paymentStatsResponse.data.stats || {});
      
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Plan Management Functions
  const handlePlanInputChange = (e) => {
    const { name, value } = e.target;
    setPlanFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetPlanForm = () => {
    setPlanFormData({
      planType: '',
      description: '',
      price: ''
    });
    setEditingPlanId(null);
    setIsEditingPlan(false);
    setOpenPlanDialog(false);
  };

  const handlePlanSubmit = async () => {
    if (!planFormData.planType || !planFormData.description || !planFormData.price) {
      setError('All fields are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (isEditingPlan) {
        await axios.put(
          `${config.apiUrl}/admin/subscriptions/${editingPlanId}`,
          planFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Subscription plan updated successfully');
      } else {
        await axios.post(
          `${config.apiUrl}/admin/subscriptions`,
          planFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Subscription plan created successfully');
      }
      
      resetPlanForm();
      fetchAllData();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEditPlan = (plan) => {
    setPlanFormData({
      planType: plan.planType,
      description: plan.description,
      price: plan.price
    });
    setEditingPlanId(plan._id);
    setIsEditingPlan(true);
    setOpenPlanDialog(true);
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.apiUrl}/admin/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Subscription plan deleted successfully');
        fetchAllData();
      } catch (error) {
        setError('Failed to delete subscription plan');
      }
    }
  };

  // Trial Management Functions
  const handleTrialAction = async () => {
    if (!selectedUser || !trialFormData.action || !trialFormData.days) {
      setError('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.apiUrl}/admin/manage-trial/${selectedUser._id}`,
        trialFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Trial ${trialFormData.action === 'extend' ? 'extended' : 'ended'} successfully`);
      setOpenTrialDialog(false);
      setSelectedUser(null);
      fetchAllData();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const openTrialManagement = (user) => {
    setSelectedUser(user);
    setOpenTrialDialog(true);
  };

  // Helper Functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'trial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRemainingDays = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading subscription data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage subscriptions, plans, and payments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800">{success}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess('')}
            className="ml-auto h-6 w-6 p-0 text-green-600 hover:text-green-800"
          >
            ×
          </Button>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="ml-auto h-6 w-6 p-0 text-red-600 hover:text-red-800"
          >
            ×
          </Button>
        </motion.div>
      )}

      {/* Analytics Cards */}
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
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSubscriptions || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeSubscriptions || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Trial Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.trialSubscriptions || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{paymentStats.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Tabs.List className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Tabs.Trigger
              value="plans"
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscription Plans</span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="users"
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span>User Subscriptions</span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="payments"
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Payment History</span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="analytics"
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Plans Tab */}
          <Tabs.Content value="plans" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Subscription Plans</h2>
              <Button onClick={() => setOpenPlanDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </Button>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-900">Plan Type</th>
                        <th className="text-left p-4 font-medium text-gray-900">Description</th>
                        <th className="text-left p-4 font-medium text-gray-900">Price</th>
                        <th className="text-left p-4 font-medium text-gray-900">Status</th>
                        <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptionPlans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No subscription plans found.
                          </td>
                        </tr>
                      ) : (
                        subscriptionPlans.map((plan) => (
                          <tr key={plan._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize">
                                {plan.planType}
                              </Badge>
                            </td>
                            <td className="p-4 max-w-xs">
                              <p className="text-sm text-gray-600 truncate">{plan.description}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-lg font-bold text-blue-600">₹{plan.price}</span>
                            </td>
                            <td className="p-4">
                              <Badge className={plan.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Users Tab */}
          <Tabs.Content value="users" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Subscriptions ({userSubscriptions.length})</h2>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-900">User</th>
                        <th className="text-left p-4 font-medium text-gray-900">Plan</th>
                        <th className="text-left p-4 font-medium text-gray-900">Status</th>
                        <th className="text-left p-4 font-medium text-gray-900">Payment</th>
                        <th className="text-left p-4 font-medium text-gray-900">End Date</th>
                        <th className="text-left p-4 font-medium text-gray-900">Remaining</th>
                        <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userSubscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            No user subscriptions found.
                          </td>
                        </tr>
                      ) : (
                        userSubscriptions.map((subscription) => (
                          <tr key={subscription._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-gray-900">{subscription.userId?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{subscription.userId?.email || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize">
                                {subscription.planType}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(subscription.status)}>
                                {subscription.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getPaymentStatusColor(subscription.paymentStatus)}>
                                {subscription.paymentStatus}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-600">
                                {subscription.status === 'trial' 
                                  ? formatDate(subscription.trialEndDate)
                                  : formatDate(subscription.endDate)
                                }
                              </p>
                            </td>
                            <td className="p-4">
                              <Badge className={subscription.status === 'trial' 
                                ? (getRemainingDays(subscription.trialEndDate) <= 1 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200')
                                : (getRemainingDays(subscription.endDate) <= 7 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200')
                              }>
                                {subscription.status === 'trial' 
                                  ? `${getRemainingDays(subscription.trialEndDate)} days`
                                  : `${getRemainingDays(subscription.endDate)} days`
                                }
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {subscription.status === 'trial' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openTrialManagement(subscription.userId)}
                                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Payments Tab */}
          <Tabs.Content value="payments" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment History ({payments.length})</h2>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-900">User</th>
                        <th className="text-left p-4 font-medium text-gray-900">Plan</th>
                        <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left p-4 font-medium text-gray-900">Status</th>
                        <th className="text-left p-4 font-medium text-gray-900">Method</th>
                        <th className="text-left p-4 font-medium text-gray-900">Date</th>
                        <th className="text-left p-4 font-medium text-gray-900">Order ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            No payment records found.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-gray-900">{payment.userId?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{payment.userId?.email || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize">
                                {payment.planType}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-lg font-bold text-blue-600">₹{payment.amount}</span>
                            </td>
                            <td className="p-4">
                              <Badge className={getPaymentStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-600">{payment.method || 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-mono text-gray-500">{payment.razorpayOrderId}</p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Plan Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.planDistribution?.map((plan, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{plan._id}</span>
                        <span className="text-sm font-medium">{plan.count} subscriptions</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Monthly Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.monthlySubscriptions?.slice(0, 6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{month._id.month}/{month._id.year}</span>
                        <span className="text-sm font-medium">{month.count} subscriptions</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Statistics */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Payment Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{paymentStats.totalPayments || 0}</p>
                    <p className="text-sm text-gray-600">Total Payments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">₹{paymentStats.totalRevenue?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{paymentStats.planStats?.length || 0}</p>
                    <p className="text-sm text-gray-600">Active Plans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </motion.div>

      {/* Plan Dialog */}
      <Dialog.Root open={openPlanDialog} onOpenChange={setOpenPlanDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div>
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{isEditingPlan ? 'Edit Plan' : 'Add New Plan'}</span>
              </Dialog.Title>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planType">Plan Type</Label>
                  <Select.Root value={planFormData.planType} onValueChange={(value) => setPlanFormData({ ...planFormData, planType: value })}>
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Select plan type" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content>
                        <Select.Viewport className="p-1">
                          <Select.Item value="monthly">
                            <Select.ItemText>Monthly</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="quarterly">
                            <Select.ItemText>Quarterly</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="yearly">
                            <Select.ItemText>Yearly</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={planFormData.price}
                    onChange={handlePlanInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={planFormData.description}
                  onChange={handlePlanInputChange}
                  placeholder="Enter plan description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetPlanForm}>
                Cancel
              </Button>
              <Button onClick={handlePlanSubmit}>
                {isEditingPlan ? 'Update Plan' : 'Add Plan'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Trial Management Dialog */}
      <Dialog.Root open={openTrialDialog} onOpenChange={setOpenTrialDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div>
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Manage Trial Period</span>
              </Dialog.Title>
            </div>
            
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Managing trial for: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Select.Root value={trialFormData.action} onValueChange={(value) => setTrialFormData({ ...trialFormData, action: value })}>
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder="Select action" />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content>
                          <Select.Viewport className="p-1">
                            <Select.Item value="extend">
                              <Select.ItemText>Extend Trial</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="end">
                              <Select.ItemText>End Trial</Select.ItemText>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                  
                  {trialFormData.action === 'extend' && (
                    <div className="space-y-2">
                      <Label htmlFor="days">Days to Extend</Label>
                      <Input
                        id="days"
                        type="number"
                        value={trialFormData.days}
                        onChange={(e) => setTrialFormData({ ...trialFormData, days: parseInt(e.target.value) })}
                        min={1}
                        max={30}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpenTrialDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleTrialAction} className="bg-yellow-600 hover:bg-yellow-700">
                {trialFormData.action === 'extend' ? 'Extend Trial' : 'End Trial'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default SubscriptionManagement;
