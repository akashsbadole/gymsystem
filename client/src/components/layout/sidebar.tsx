import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Users,
  CreditCard,
  BarChart2,
  Bell,
  MapPin,
  UserCog,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home
    },
    {
      title: "Members",
      href: "/members",
      icon: Users
    },
    {
      title: "Payments",
      href: "/payments",
      icon: CreditCard
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart2
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell
    },
    {
      title: "Locations",
      href: "/locations",
      icon: MapPin
    },
    {
      title: "Staff",
      href: "/staff",
      icon: UserCog
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className={cn("bg-white w-64 flex-shrink-0 border-r border-gray-200 hidden md:flex md:flex-col h-screen", className)}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="bg-primary rounded-md p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">MyGymWebApp</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</p>
        </div>
        
        {menuItems.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50",
                location === item.href && "text-gray-700 bg-primary-50 border-r-4 border-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5 mr-3", location === item.href ? "text-primary" : "text-gray-500")} />
              <span className={cn(location === item.href && "font-medium")}>{item.title}</span>
            </a>
          </Link>
        ))}
        
        <div className="px-4 py-2 mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
        </div>
        
        {menuItems.slice(5).map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50",
                location === item.href && "text-gray-700 bg-primary-50 border-r-4 border-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5 mr-3", location === item.href ? "text-primary" : "text-gray-500")} />
              <span className={cn(location === item.href && "font-medium")}>{item.title}</span>
            </a>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="flex items-center p-2 text-gray-600 rounded-md">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Owner'}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full mt-4 gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
