import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Dashboardm from "./pages/Dashboardm";
import Dashboarda from "./pages/Dashboarda";
import Dashboards from "./pages/Dashboards";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

// Layout and Protected Routes
import AppLayout from "./components/Layout/AppLayout";
import ProtectedRoute from "./components/Layout/ProtectedRoute"; // 1. Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Admin Dashboard (admin only) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboarda" element={<AppLayout><Dashboarda userRole="admin" /></AppLayout>} />
        </Route>

        {/* Manager Dashboard (manager only) */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path="/dashboardm" element={<AppLayout><Dashboardm userRole="manager" /></AppLayout>} />
        </Route>

        {/* Staff Dashboard (staff only) */}
        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/dashboards" element={<AppLayout><Dashboards userRole="staff" /></AppLayout>} />
        </Route>

        {/* Shared Pages (accessible by all logged-in roles) */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']} />}>
          <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
          <Route path="/orders" element={<AppLayout><Orders /></AppLayout>} />
        </Route>

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;