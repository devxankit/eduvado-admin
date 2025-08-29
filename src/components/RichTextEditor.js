import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react';

const RichTextEditor = ({ 
  title, 
  content, 
  onSave, 
  loading = false,
  showVersion = true,
  lastUpdated = null,
  lastUpdatedBy = null 
}) => {
  const [text, setText] = useState(content || '');
  const [version, setVersion] = useState('1.0');
  const [showAlert, setShowAlert] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) {
      setShowAlert(true);
      return;
    }
    
    try {
      await onSave(text, version);
      setShowAlert(false);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const insertText = (tag) => {
    const textarea = document.getElementById('rich-text-area');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    switch (tag) {
      case 'bold':
        replacement = `**${selectedText || 'Bold Text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'Italic Text'}*`;
        break;
      case 'underline':
        replacement = `__${selectedText || 'Underlined Text'}__`;
        break;
      case 'bullet':
        replacement = `\n• ${selectedText || 'List Item'}`;
        break;
      case 'number':
        replacement = `\n1. ${selectedText || 'List Item'}`;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'Quote Text'}`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        replacement = `[${selectedText || 'Link Text'}](https://example.com)`;
        break;
      default:
        replacement = selectedText;
    }
    
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setText(newText);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const TooltipButton = ({ children, title, onClick }) => (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="h-8 w-8 p-0"
          >
            {children}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            sideOffset={5}
          >
            {title}
            <Tooltip.Arrow className="fill-current" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">Edit and format your content using Markdown</p>
        </div>
        {showVersion && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="version" className="text-sm font-medium">Version:</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-24 h-8 text-sm"
            />
          </div>
        )}
      </div>

      {/* Alert */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Content cannot be empty. Please add some content before saving.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlert(false)}
            className="ml-auto h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
          >
            ×
          </Button>
        </motion.div>
      )}

      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center space-x-1 flex-wrap">
            <TooltipButton title="Bold" onClick={() => insertText('bold')}>
              <Bold className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton title="Italic" onClick={() => insertText('italic')}>
              <Italic className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton title="Underline" onClick={() => insertText('underline')}>
              <Underline className="h-4 w-4" />
            </TooltipButton>
            
            <Separator orientation="vertical" className="h-6" />
            
            <TooltipButton title="Bullet List" onClick={() => insertText('bullet')}>
              <List className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton title="Numbered List" onClick={() => insertText('number')}>
              <ListOrdered className="h-4 w-4" />
            </TooltipButton>
            
            <Separator orientation="vertical" className="h-6" />
            
            <TooltipButton title="Quote" onClick={() => insertText('quote')}>
              <Quote className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton title="Code" onClick={() => insertText('code')}>
              <Code className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton title="Link" onClick={() => insertText('link')}>
              <Link className="h-4 w-4" />
            </TooltipButton>
          </div>
        </CardContent>
      </Card>

      {/* Text Area */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <textarea
            id="rich-text-area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start writing your content here... Use the toolbar above to format your text."
            className="w-full min-h-[400px] p-3 border border-gray-200 rounded-lg resize-y font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={20}
          />
        </CardContent>
      </Card>

      {/* Info and Save Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {lastUpdated && (
            <p className="text-sm text-gray-600">
              Last updated: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
              {lastUpdatedBy && ` by ${lastUpdatedBy}`}
            </p>
          )}
        </div>
        
        <Button
          onClick={handleSave}
          disabled={loading || !text.trim()}
          size="lg"
          className="px-6"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Markdown Preview Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Markdown Support</h3>
              <p className="text-sm text-blue-700 mt-1">
                This editor supports Markdown formatting. Your content will be displayed with proper formatting on the user-facing pages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RichTextEditor;
