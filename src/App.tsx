import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { Toaster } from 'react-hot-toast';
import { Megaphone, Users, Mail, Settings, Zap, BarChart3, Monitor } from 'lucide-react';
import { cn } from "@/lib/utils";
import { WorkspaceProvider } from './hooks/useWorkspace';
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher';

const queryClient = new QueryClient();

function App() {
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Campaigns',
      href: '/campaigns',
      icon: Megaphone,
      description: 'Create and manage campaigns'
    },
    {
      title: 'Campaign Monitor',
      href: '/campaign-monitor',
      icon: Monitor,
      description: 'Real-time monitoring'
    },
    {
      title: 'Users',
      href: '/users',
      icon: Users,
      description: 'Manage user database'
    },
    {
      title: 'Templates',
      href: '/templates',
      icon: Mail,
      description: 'Email & SMS templates'
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Performance insights'
    }
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'glass-card',
            style: {
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '12px'
            }
          }}
        />
        <div className="flex h-screen bg-background font-sans">
          {/* Modern Sidebar */}
          <nav className="w-72 glass-card border-r border-card-border/50 p-6 flex flex-col shadow-xl m-4 mr-0 rounded-l-2xl">
            {/* Header */}
            <div className="pb-8 mb-6 border-b border-border/30">
              <WorkspaceSwitcher />
            </div>
            
            {/* Navigation */}
            <ul className="space-y-2 flex-grow">
              {navigationItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <NavLink 
                      to={item.href} 
                      className={cn(
                        "flex items-center p-4 rounded-xl transition-all duration-200 group relative",
                        "hover:bg-primary/5 hover:border-primary/20 border border-transparent",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 mr-3 transition-transform group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                      )} />
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium text-sm",
                          isActive ? "text-primary-foreground" : "text-foreground group-hover:text-foreground"
                        )}>
                          {item.title}
                        </div>
                        <div className={cn(
                          "text-xs mt-0.5",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            
            {/* Settings */}
            <div className="pt-6 mt-6 border-t border-border/30">
              <NavLink 
                to="/settings"
                className={({ isActive }) => cn(
                  "flex items-center p-4 rounded-xl transition-all duration-200",
                  "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Settings</span>
              </NavLink>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <ReactFlowProvider>
                  <Outlet />
                </ReactFlowProvider>
              </div>
            </div>
          </main>
        </div>
      </WorkspaceProvider>
    </QueryClientProvider>
  )
}

export default App