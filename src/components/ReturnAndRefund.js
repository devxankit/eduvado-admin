import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config/config';
import RichTextEditor from './RichTextEditor';
import { RotateCcw, Info, RefreshCw } from 'lucide-react';

const ReturnAndRefund = () => {
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCurrentPolicy();
  }, []);

  const fetchCurrentPolicy = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${config.apiUrl}/content/admin/return-refund`);
      if (response.data && response.data.length > 0) {
        // Find the active policy
        const activePolicy = response.data.find(policy => policy.isActive) || response.data[0];
        setCurrentPolicy(activePolicy);
      }
    } catch (error) {
      console.error('Error fetching return and refund policy:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch return and refund policy');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (content, version) => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/content/admin/return-refund`, {
        content,
        version
      });
      
      setCurrentPolicy(response.data);
      toast.success('Return and refund policy updated successfully!');
      
      // Refresh the current policy
      await fetchCurrentPolicy();
    } catch (error) {
      console.error('Error saving return and refund policy:', error);
      toast.error('Failed to save return and refund policy');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading return and refund policy...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Return & Refund Policy Management</h1>
          <p className="text-gray-600 mt-1">Manage your website's return and refund policy content</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCurrentPolicy}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Return & Refund Policy Content</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Manage your website's return and refund policy content. This content will be displayed to users on the return and refund policy page.
                  You can use the formatting toolbar to style your content with Markdown.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rich Text Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5" />
              <span>Return & Refund Policy Content</span>
            </CardTitle>
            <CardDescription>
              Edit and manage your return and refund policy content using the rich text editor below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              title="Return & Refund Policy Content"
              content={currentPolicy?.content || ''}
              onSave={handleSave}
              loading={loading}
              lastUpdated={currentPolicy?.lastUpdatedAt}
              lastUpdatedBy={currentPolicy?.lastUpdatedBy?.name}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReturnAndRefund;
