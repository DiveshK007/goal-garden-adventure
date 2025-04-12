
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Calendar, Award, BarChart, Brain, User, Menu, X, Gamepad, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
        isActive
          ? "bg-garden-green text-white font-medium dark:bg-garden-purple"
          : "hover:bg-garden-light dark:hover:bg-gray-800"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const [coinCount, setCoinCount] = useState(120);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: "/", icon: <Calendar size={20} />, label: "Tasks" },
    { to: "/analytics", icon: <BarChart size={20} />, label: "Analytics" },
    { to: "/rewards", icon: <Award size={20} />, label: "Rewards" },
    { to: "/destress", icon: <Brain size={20} />, label: "Destress" },
    { to: "/minigames", icon: <Gamepad size={20} />, label: "Mini Games" },
    { to: "/chat", icon: <User size={20} />, label: "AI Buddy" },
    { to: "/profile", icon: <User size={20} />, label: "Profile" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="bg-white shadow-sm py-3 px-4 flex justify-between items-center dark:bg-gray-800 dark:border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="flex items-center text-xl font-bold text-garden-green dark:text-garden-purple">
              <span className="text-2xl mr-1">🌱</span> HORIZON
            </span>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
          
          <div className="bg-garden-light rounded-full px-3 py-1 flex items-center gap-1 dark:bg-gray-700">
            <Award size={18} className="text-garden-orange" />
            <span className="font-medium">{coinCount}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toast({
              title: "No new notifications",
              description: "You're all caught up!",
            })}
          >
            <Bell size={20} />
          </Button>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
          <nav className="space-y-1 mt-6">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-64 h-full bg-white shadow-lg dark:bg-gray-800"
            >
              <div className="p-4">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                    <X size={20} />
                  </Button>
                </div>
                <nav className="space-y-1 mt-6">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      isActive={location.pathname === item.to}
                      onClick={toggleMobileMenu}
                    />
                  ))}
                </nav>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
