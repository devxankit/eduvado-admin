import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config/config';
import RichTextEditor from './RichTextEditor';
import { FileText, Info, RefreshCw } from 'lucide-react';

const TermsAndConditions = () => {
  const [currentTerms, setCurrentTerms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCurrentTerms();
  }, []);

  const fetchCurrentTerms = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${config.apiUrl}/content/admin/terms-conditions`);
      if (response.data && response.data.length > 0) {
        // Find the active terms
        const activeTerms = response.data.find(terms => terms.isActive) || response.data[0];
        setCurrentTerms(activeTerms);
      }
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch terms and conditions');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (content, version) => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/content/admin/terms-conditions`, {
        content,
        version
      });
      
      setCurrentTerms(response.data);
      toast.success('Terms and conditions updated successfully!');
      
      // Refresh the current terms
      await fetchCurrentTerms();
    } catch (error) {
      console.error('Error saving terms and conditions:', error);
      toast.error('Failed to save terms and conditions');
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
          <span className="text-gray-600">Loading terms and conditions...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions Management</h1>
          <p className="text-gray-600 mt-1">Manage your website's terms and conditions content</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCurrentTerms}>
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
                <h3 className="text-sm font-medium text-blue-900">Terms & Conditions Content</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Manage your website's terms and conditions content. This content will be displayed to users on the terms and conditions page.
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
              <FileText className="h-5 w-5" />
              <span>Terms & Conditions Content</span>
            </CardTitle>
            <CardDescription>
              Edit and manage your terms and conditions content using the rich text editor below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              title="Terms & Conditions Content"
              content={currentTerms?.content || ''}
              onSave={handleSave}
              loading={loading}
              lastUpdated={currentTerms?.lastUpdatedAt}
              lastUpdatedBy={currentTerms?.lastUpdatedBy?.name}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
