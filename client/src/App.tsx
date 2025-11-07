import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import TripDetail from "./pages/TripDetail";
import Explore from "./pages/Explore";
import Trips from "./pages/Trips";
import Profile from "./pages/Profile";
import Planner from "./pages/Planner";
import PlannerDetail from "./pages/PlannerDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/trips"} component={Trips} />
      <Route path={"/trips/:id"} component={TripDetail} />
      <Route path={"/destinations"} component={Destinations} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/planner"} component={Planner} />
      <Route path={"/planner/:id"} component={PlannerDetail} />
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
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
