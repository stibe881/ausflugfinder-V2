import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
import WebSocketDebug from "./pages/WebSocketDebug";
import { InstallPromptDialog } from "./components/InstallPromptDialog";
import { AutoLogoutDialog } from "./components/AutoLogoutDialog";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useAutoLogout } from "./hooks/useAutoLogout";
import { useWebSocketNotifications } from "./hooks/useWebSocketNotifications";
import { ThemeLanguageToggle } from "./components/ThemeLanguageToggle"; // Re-added this import
import { PushNotificationPrompt } from "./components/PushNotificationPrompt";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { initCapacitorPushNotifications, isCapacitorApp } from "@/services/capacitorPush";

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
      <Route path={"/ws-debug"} component={WebSocketDebug} />
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
    handleInstallClick,
  } = useInstallPrompt();

  // Initialize WebSocket notifications on app load
  const { isConnected, error } = useWebSocketNotifications();

  // Log WebSocket status changes for debugging
  useEffect(() => {
    console.log('📡 WebSocket Status:', isConnected ? 'Connected' : 'Disconnected');
    if (error) {
      console.error('❌ WebSocket Error:', error);
    }
  }, [isConnected, error]);

  // Initialize Capacitor push notifications if running as native app
  useEffect(() => {
    const initCapacitorPush = async () => {
      if (isCapacitorApp()) {
        console.log('[App] Capacitor environment detected');
        await initCapacitorPushNotifications();
      }
    };

    initCapacitorPush();
  }, []);


  // Force Service Worker update on mount (critical for iOS PWA)
  // Delayed to allow WebSocket to connect first
  useEffect(() => {
    const timer = setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.update().catch((err) => {
              console.warn('[SW] Failed to update Service Worker:', err);
            });
          }
        }).catch((err) => {
          console.warn('[SW] Failed to get Service Worker registrations:', err);
        });
      }
    }, 2000); // Delay by 2 seconds to allow WebSocket to establish first

    return () => clearTimeout(timer);
  }, []);

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

  const sendTestWebPushMutation = trpc.push.sendTestWebPushNotification.useMutation();

  const handleSendTestWebPush = () => {
    sendTestWebPushMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(`Fehler beim Senden des Test-Push: ${error.message}`);
      }
    });
  };

  return (
    <ErrorBoundary>
      <I18nProvider defaultLanguage="de">
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            <PushNotificationPrompt />
            {/* Test Web Push Button - Large and visible for debugging */}
            <button
              onClick={handleSendTestWebPush}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 9999,
              }}
            >
              📬 Test Push
            </button>

            <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
              <ThemeLanguageToggle
                isAppInstalled={isAppInstalled}
                handleInstallClick={handleInstallClick}
              />
            </div>
            <Router />



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
