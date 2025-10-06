import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const clickBadgeClose = () => {
      const badge = document.querySelector('[data-lovable-badge]') || 
                    document.querySelector('a[href*="lovable.dev"]')?.closest('div');
      
      if (badge) {
        const closeButton = badge.querySelector('button') || 
                          badge.querySelector('[role="button"]') ||
                          badge.querySelector('svg')?.closest('button');
        
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      }
    };

    const interval = setInterval(clickBadgeClose, 100);
    
    const observer = new MutationObserver(() => {
      clickBadgeClose();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
