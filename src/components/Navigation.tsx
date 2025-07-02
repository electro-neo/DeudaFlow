import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "../supabaseClient";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/clients",
      label: "Clientes",
      icon: Users,
    },
    {
      href: "/transactions",
      label: "Movimientos",
      icon: Activity,
    },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              DebtManager
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "transition-all duration-200",
                    isActive && "shadow-md"
                  )}
                >
                  <Link to={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
            {/* Botón de cerrar sesión */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="transition-all duration-200"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};