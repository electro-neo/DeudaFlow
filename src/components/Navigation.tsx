import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Activity, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "../supabaseClient";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Elimina clientes y transacciones del usuario invitado al cerrar sesión
  const handleGuestLogoutCleanup = async () => {
    const guestEmail = "invitado@demo.com";
    const user = await supabase.auth.getUser();
    if (user.data?.user?.email === guestEmail) {
      await supabase.from("transactions").delete().eq("user_id", user.data.user.id);
      await supabase.from("clients").delete().eq("user_id", user.data.user.id);
    }
  };

  const handleLogout = async () => {
    await handleGuestLogoutCleanup();
    await supabase.auth.signOut();
    // Borra cookies de Google para forzar selección de cuenta
    document.cookie = "G_AUTHUSER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "G_ENABLED_IDPS=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Opcional: borra todas las cookies de dominio actual (solo frontend, no httpOnly)
    if (window.location.hostname !== "localhost") {
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    }
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
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              DebtManager
            </div>
          </div>
          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-1 ml-8">
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
          </div>
          {/* Botón de cerrar sesión desktop */}
          <div className="hidden md:flex flex-1 justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="transition-all duration-200"
            >
              Cerrar sesión
            </Button>
          </div>
          {/* Botón hamburguesa móvil */}
          <div className="md:hidden flex-1 flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="md:hidden absolute left-0 top-16 w-full bg-background border-b z-50 shadow-lg animate-fade-in">
            <div className="flex flex-col items-center py-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    size="lg"
                    asChild
                    className={cn("w-11/12 justify-start", isActive && "shadow-md")}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link to={item.href} className="flex items-center gap-2 w-full">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
              <Button
                variant="destructive"
                size="lg"
                className="w-11/12"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};