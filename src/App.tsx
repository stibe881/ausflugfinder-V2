import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/CookiePolicy";
import Imprint from "./pages/Imprint";
import { CookieBanner } from "./components/CookieBanner";
import { PrivacyFooter } from "./components/PrivacyFooter";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/imprint" component={Imprint} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  console.log('[App] Rendering App component');

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <Router />
            </div>
            <PrivacyFooter />
          </div>
          {/* Development helper to reset cookie consent */}
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => {
                window.localStorage.removeItem("cookieConsent");
                window.location.reload();
              }}
              className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded"
            >
              Reset Cookie Consent (dev)
            </button>
          )}
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
