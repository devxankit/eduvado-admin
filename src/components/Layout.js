import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Shield, 
  FileText, 
  RotateCcw, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Settings,
  Bell,
  BarChart3,
  Cog,
  HelpCircle,
  Zap,
  Star,
  MessageSquare
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      section: 'Main',
      items: [
        { 
          text: 'Dashboard', 
          icon: <LayoutDashboard className="h-5 w-5" />, 
          path: '/dashboard',
          description: 'Overview and analytics',
          badge: 'Live'
        },
        { 
          text: 'Users', 
          icon: <Users className="h-5 w-5" />, 
          path: '/users',
          description: 'Manage user accounts'
        },
        { 
          text: 'Courses', 
          icon: <BookOpen className="h-5 w-5" />, 
          path: '/courses',
          description: 'Course management'
        },
        { 
          text: 'Subscriptions', 
          icon: <CreditCard className="h-5 w-5" />, 
          path: '/subscriptions',
          description: 'Subscription plans'
        },
      ]
    },
    {
      section: 'Content',
      items: [
        { 
          text: 'Privacy Policy', 
          icon: <Shield className="h-5 w-5" />, 
          path: '/privacy-policy',
          description: 'Privacy policy content'
        },
        { 
          text: 'Terms & Conditions', 
          icon: <FileText className="h-5 w-5" />, 
          path: '/terms-conditions',
          description: 'Terms and conditions'
        },
        { 
          text: 'Return & Refund', 
          icon: <RotateCcw className="h-5 w-5" />, 
          path: '/return-refund',
          description: 'Return and refund policy'
        },
      ]
    },
    {
      section: 'Tools',
      items: [
        { 
          text: 'Analytics', 
          icon: <BarChart3 className="h-5 w-5" />, 
          path: '/analytics',
          description: 'Advanced analytics',
          badge: 'New'
        },
        { 
          text: 'Settings', 
          icon: <Cog className="h-5 w-5" />, 
          path: '/settings',
          description: 'System settings'
        },
        { 
          text: 'Support', 
          icon: <HelpCircle className="h-5 w-5" />, 
          path: '/support',
          description: 'Help and support'
        },
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -280) 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed lg:relative left-0 top-0 z-50 h-full bg-white shadow-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-70'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600">
                <AvatarImage src="/logo192.png" alt="Eduvado" />
                <AvatarFallback className="text-white text-sm font-bold">
                  E
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Eduvado
                  </h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              )}
            </motion.div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex h-8 w-8"
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
            {menuItems.map((section, sectionIndex) => (
              <div key={section.section}>
                {!collapsed && (
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                    className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                  >
                    {section.section}
                  </motion.h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (index * 0.05) }}
                    >
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className={`transition-colors relative ${
                          isActive(item.path) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                          {item.icon}
                          {item.badge && (
                            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white border-0">
                              {item.badge === 'Live' ? <Zap className="h-2 w-2" /> : <Star className="h-2 w-2" />}
                            </Badge>
                          )}
                        </div>
                        {!collapsed && (
                          <>
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between">
                                <span>{item.text}</span>
                              </div>
                              <div className="text-xs text-muted-foreground font-normal">
                                {item.description}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-700 transition-colors" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Separator className="mb-4" />
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'admin@eduvado.com'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className={`w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ${
                collapsed ? 'px-2' : ''
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!collapsed && 'Sign Out'}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white border-0">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 