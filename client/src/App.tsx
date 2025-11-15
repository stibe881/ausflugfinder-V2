import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/i18nContext";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Friends from "./pages/Friends";
import TripDetail from "./pages/TripDetail";
import Trips from "./pages/Trips";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Planner from "./pages/Planner";
import PlannerDetail from "./pages/PlannerDetail";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { InstallPromptDialog } from "./components/InstallPromptDialog";
import { AutoLogoutDialog } from "./components/AutoLogoutDialog";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useAutoLogout } from "./hooks/useAutoLogout";
import { useWebSocketNotifications } from "./hooks/useWebSocketNotifications";
import { ThemeLanguageToggle } from "./components/ThemeLanguageToggle"; // Re-added this import

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/trips/:id"} component={TripDetail} />
      <Route path={"/mytrips"} component={Trips} />
      <Route path={"/destinations"} component={Destinations} />
      <Route path={"/friends"} component={Friends} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/planner"} component={Planner} />
      <Route path={"/planner/:id"} component={PlannerDetail} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
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

function AppContent() {
  const [location] = useLocation();
  const [showAutoLogoutDialog, setShowAutoLogoutDialog] = useState(false);
  const {
    isAppInstalled,
    showInstallPromptDialog,
    showInstallPromptInstructions,
    handleInstallClick,
    handleDismissInstallPromptDialog,
  } = useInstallPrompt();

  // Initialize WebSocket notifications on app load
  useWebSocketNotifications();

  // Don't enable auto-logout on login page
  const isLoginPage = location === '/login';

  // Memoize logout handler to avoid creating new function every render
  const handleLogout = useCallback(() => {
    // Clear auth tokens
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');

    // Redirect to login
    window.location.href = '/login';
  }, []);

  // Memoize auto-logout handler
  const handleAutoLogout = useCallback(() => {
    setShowAutoLogoutDialog(true);
  }, []);

  const { isAutoLogoutDisabled, setAutoLogoutDisabled } = useAutoLogout(
    handleAutoLogout,
    isAppInstalled && !isLoginPage // Only enable auto-logout when NOT on login page
  );

  return (
    <ErrorBoundary>
      <I18nProvider defaultLanguage="de">
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            <div className="fixed top-4 right-4 flex items-center gap-2">
              <ThemeLanguageToggle
                isAppInstalled={isAppInstalled}
                showInstallPromptDialog={showInstallPromptDialog}
                showInstallPromptInstructions={showInstallPromptInstructions}
              />
            </div>
            <Router />

            {/* Install Prompt Dialog */}
            <InstallPromptDialog
              open={showInstallPromptDialog}
              onInstall={handleInstallClick}
              onDismiss={handleDismissInstallPromptDialog}
            />

            {/* Auto-Logout Dialog */}
            {!isLoginPage && (
              <AutoLogoutDialog
                open={showAutoLogoutDialog}
                onLogout={handleLogout}
                onStayLoggedIn={() => setShowAutoLogoutDialog(false)}
                isAppInstalled={isAppInstalled}
                onDisableAutoLogout={setAutoLogoutDisabled}
              />
            )}
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

function App() {
  return <AppContent />;
}

export default App;
