import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TransactionInformation from "./pages/TransactionInformation";
import PersonalInformation from "./pages/PersonalInformation";
import AdditionalParties from "./pages/AdditionalParties";
import AdditionalPartyOne from "./pages/AdditionalPartyOne";
import AdditionalPartyTwo from "./pages/AdditionalPartyTwo";
import AdditionalPartyThree from "./pages/AdditionalPartyThree";
import AdditionalPartyFour from "./pages/AdditionalPartyFour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transaction-information" element={<TransactionInformation />} />
          <Route path="/personal-information" element={<PersonalInformation />} />
          <Route path="/additional-parties" element={<AdditionalParties />} />
          <Route path="/additional-party-one" element={<AdditionalPartyOne />} />
          <Route path="/additional-party-two" element={<AdditionalPartyTwo />} />
          <Route path="/additional-party-three" element={<AdditionalPartyThree />} />
          <Route path="/additional-party-four" element={<AdditionalPartyFour />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
