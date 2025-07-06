import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "../context/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Activity, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "../supabaseClient";
import ReactDOM from "react-dom";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currency, setCurrency, rate, setRate } = useCurrency();

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
      <div className="container mx-auto px-4 relative z-30">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
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
          {/* Toggle moneda y tasa: visible en todas las resoluciones, botón cerrar sesión solo en desktop */}
          <div className="flex flex-1 justify-end items-center gap-6 relative z-20">
            <div className="flex items-center gap-1 md:gap-2 ml-8 md:ml-12">
              <span className={currency === "COP" ? "font-bold text-primary" : "text-muted-foreground"}>💱</span>
              <Switch
                checked={currency === "USD"}
                onCheckedChange={(checked) => setCurrency(checked ? "USD" : "COP")}
                className="mx-1"
                aria-label="Cambiar moneda"
              />
              <span className={currency === "USD" ? "font-bold text-primary" : "text-muted-foreground"}>USD</span>
              {currency === "USD" && (
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  value={rate === 0 ? '' : rate}
                  onChange={e => {
                    const val = e.target.value.replace(',', '.');
                    setRate(val === '' ? 0 : parseFloat(val));
                  }}
                  className="w-16 sm:w-20 ml-1 text-right"
                  title="Tasa de conversión a USD"
                  aria-label="Tasa de conversión a USD"
                  placeholder="Tasa"
                  autoComplete="off"
                />
              )}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="transition-all duration-200 hidden md:inline-flex"
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
        {menuOpen && ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[99]"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMenuOpen(false);
            }}
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <div className="absolute right-4 top-16 z-[101] flex flex-col items-end gap-2 animate-fade-in">
              <div className="flex flex-col items-end gap-2 bg-white dark:bg-background rounded-xl shadow-lg py-2 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className={cn("min-w-fit px-3 py-1 text-base rounded-md flex items-center", isActive && "shadow-md")}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
                <Button
                  variant="destructive"
                  size="sm"
                  className="min-w-fit px-3 py-1 text-base rounded-md flex items-center"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </nav>
  );
};