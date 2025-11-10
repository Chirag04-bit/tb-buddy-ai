import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "./pages/Home";
import TBDiagnosis from "./pages/TBDiagnosis";
import SymptomChecker from "./pages/SymptomChecker";
import Treatments from "./pages/Treatments";
import Medicines from "./pages/Medicines";
import Hospitals from "./pages/Hospitals";
import Emergency from "./pages/Emergency";
import Auth from "./pages/Auth";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tb-diagnosis" element={<TBDiagnosis />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/treatments" element={<Treatments />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
