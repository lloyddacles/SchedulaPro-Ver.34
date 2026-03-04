import { ReactNode, useState } from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, Calendar, SquareCheck, Users, 
  FileText, Settings, Bell, Moon, Sun, LogOut, Menu, X,
  BookOpen, TriangleAlert, Sparkles, Lightbulb, UserCog
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
  user: { id?: string; name: string; email: string; role: UserRole };
  onSignOut: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onRoleChange?: (role: UserRole) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  notificationCount?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[];
  badge?: number;
}

export function AppLayout({ 
  children, 
  user, 
  onSignOut,
  currentView, 
  onViewChange, 
  onRoleChange,
  theme,
  onThemeToggle,
  notificationCount = 0
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin', 'faculty'],
    },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin'],
    },
    {
      id: 'create-schedule',
      label: 'Create Schedule',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head'],
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: <SquareCheck className="w-5 h-5" />,
      roles: ['program_head', 'admin'],
      badge: 2,
    },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: <TriangleAlert className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head'],
    },
    {
      id: 'faculty',
      label: 'Faculty',
      icon: <Users className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin'],
    },
    {
      id: 'faculty-profiling',
      label: 'Faculty Profiling',
      icon: <UserCog className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin'],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin'],
    },
    {
      id: 'optimizer',
      label: 'AI Optimizer',
      icon: <Sparkles className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head'],
    },
    {
      id: 'optimization-demo',
      label: 'Optimization Demo',
      icon: <Lightbulb className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['program_assistant', 'program_head', 'admin'],
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      program_assistant: 'Program Assistant',
      program_head: 'Program Head',
      admin: 'Administrator',
      faculty: 'Faculty',
    };
    return labels[role];
  };

  return (
    <div className="flex h-screen bg-secondary overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl text-sidebar-foreground">SchedulaPro</h1>
              <p className="text-xs text-sidebar-foreground/70">Academic Scheduling</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm text-sidebar-foreground">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/70">{getRoleLabel(user.role)}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onRoleChange?.('program_assistant')}>
                Program Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange?.('program_head')}>
                Program Head
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange?.('admin')}>
                Administrator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange?.('faculty')}>
                Faculty
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h2 className="text-foreground">
                {visibleMenuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}