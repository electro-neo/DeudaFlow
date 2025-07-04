import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { Transactions } from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/Navigation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();
  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/forgot-password";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!hideNav && <Navigation />}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
