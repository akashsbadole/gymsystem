import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import MembersPage from "@/pages/members-page";
import PaymentsPage from "@/pages/payments-page";
import ReportsPage from "@/pages/reports-page";
import NotificationsPage from "@/pages/notifications-page";
import LocationsPage from "@/pages/locations-page";
import StaffPage from "@/pages/staff-page";
import SettingsPage from "@/pages/settings-page";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/members" component={MembersPage} />
      <ProtectedRoute path="/payments" component={PaymentsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/locations" component={LocationsPage} />
      <ProtectedRoute path="/staff" component={StaffPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
