import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import TechnicianLogin from "./pages/TechnicianLogin";
import TechnicianKYC from "./pages/TechnicianKYC";
import TechnicianKYCPending from "./pages/TechnicianKYCPending";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";
import AITasks from "./pages/AITasks";
import BundleCheckout from "./pages/BundleCheckout";
import Install from "./pages/Install";
import BecomeHelper from "./pages/BecomeHelper";
import NotFound from "./pages/NotFound";
import SupportWidget from "./components/support/SupportWidget";
import ServiceBundleCart from "./components/bundling/ServiceBundleCart";
import ScrollToTop from "./components/common/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:category" element={<Services />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/bundle-checkout" element={<BundleCheckout />} />
          <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/technician/login" element={<TechnicianLogin />} />
          <Route path="/technician/kyc" element={<TechnicianKYC />} />
          <Route path="/technician/kyc-pending" element={<TechnicianKYCPending />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/ai-tasks" element={<AITasks />} />
          <Route path="/install" element={<Install />} />
          <Route path="/become-helper" element={<BecomeHelper />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportWidget />
        <ServiceBundleCart />
        <ScrollToTop />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
