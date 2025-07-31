import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  userRole: string;
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["admin", "manager", "staff"]
    },
    {
      icon: Package,
      label: "Products",
      path: "/products",
      roles: ["admin", "manager"]
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      path: "/orders",
      roles: ["admin", "manager", "staff"]
    },
    {
      icon: AlertTriangle,
      label: "Inventory",
      path: "/inventory",
      roles: ["admin", "manager"]
    },
    {
      icon: FileText,
      label: "Reports",
      path: "/reports",
      roles: ["admin", "manager"]
    },
    {
      icon: Users,
      label: "Users",
      path: "/users",
      roles: ["admin"]
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      roles: ["admin", "manager", "staff"]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">InvenTech</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isCollapsed && "justify-center px-0",
                isActive && "bg-primary text-primary-foreground shadow-elegant"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;