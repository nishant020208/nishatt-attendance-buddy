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
      // Multiple selector strategies
      const selectors = [
        '[data-lovable-badge]',
        'a[href*="lovable"]',
        'a[href*="lovable.dev"]',
        'div[class*="lovable"]',
        'div[class*="badge"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Try to find and click close button
          const closeBtn = element.querySelector('button') ||
                          element.querySelector('[aria-label*="close"]') ||
                          element.querySelector('[aria-label*="Close"]') ||
                          element.querySelector('svg')?.parentElement as HTMLElement;
          
          if (closeBtn && closeBtn.tagName === 'BUTTON') {
            closeBtn.click();
          }

          // Try to hide the badge directly
          const badgeElement = element.closest('div') as HTMLElement;
          if (badgeElement) {
            badgeElement.style.display = 'none';
            badgeElement.style.visibility = 'hidden';
            badgeElement.style.opacity = '0';
            badgeElement.style.pointerEvents = 'none';
          }
        });
      }

      // Also try to find and hide any iframe or container with lovable
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe.src?.includes('lovable') || iframe.id?.includes('lovable')) {
          (iframe as HTMLElement).style.display = 'none';
        }
      });
    };

    // Run immediately
    clickBadgeClose();

    // Run every 50ms for aggressive removal
    const interval = setInterval(clickBadgeClose, 50);
    
    // Watch for DOM changes
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
