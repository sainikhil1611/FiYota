import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserFinancialProfile } from "@/types/userProfile";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Inventory from "./pages/Inventory";
import Quiz from "./pages/Quiz";
import AppLayout from "@/components/AppLayout";
import PreApproval from "./pages/PreApproval";
import Applications from "./pages/Applications";

const queryClient = new QueryClient();

const App = () => {
  // Shared user profile state across all pages
  const [userProfile, setUserProfile] = useState<UserFinancialProfile>({
    monthlyIncome: 5000,
    creditScore: 720,
    maxDownPayment: 5000,
    preferredMonthlyPayment: 500,
    hasTradeIn: false,
    tradeInValue: 0,
    financingType: 'finance',
    loanTerm: 60,
    interestRate: 5.5
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/dashboard"
                element={
                  <Index
                    userProfile={userProfile}
                    onProfileChange={setUserProfile}
                  />
                }
              />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/preapproval" element={<PreApproval />} />
              <Route path="/applications" element={<Applications />} />
              <Route
                path="/profile"
                element={
                  <Profile
                    profile={userProfile}
                    onProfileChange={setUserProfile}
                  />
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
