import { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";

// ✅ Lazy load các component
const CustomerApp = lazy(() =>
  import("./components/CustomerApp").then((m) => ({
    default: m.CustomerApp,
  }))
);
const PhotographerApp = lazy(() =>
  import("./components/PhotographerApp").then((m) => ({
    default: m.PhotographerApp,
  }))
);
const LandingPage = lazy(() =>
  import("./components/LandingPage").then((m) => ({
    default: m.LandingPage,
  }))
);
const PhotographerDiscovery = lazy(() =>
  import("./components/PhotographerDiscovery").then((m) => ({
    default: m.PhotographerDiscovery,
  }))
);
const AllPhotographers = lazy(() =>
  import("./components/AllPhotographers").then((m) => ({
    default: m.AllPhotographers,
  }))
);
const CustomerAuth = lazy(() =>
  import("./components/customer/CustomerAuth").then((m) => ({
    default: m.CustomerAuth,
  }))
);
const PhotographerAuth = lazy(() =>
  import("./components/photographer/PhotographerAuth").then((m) => ({
    default: m.PhotographerAuth,
  }))
);
// const BookingDetailDemo = lazy(() =>
//   import("./components/other/BookingDetailDemo").then((m) => ({
//     default: m.BookingDetailDemo,
//   }))
// );
const SidebarDemo = lazy(() =>
  import("./components/SidebarDemo").then((m) => ({
    default: m.SidebarDemo,
  }))
);

// ✅ Loading UI
function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (role === "photographer") navigate("/photographer");
    else if (role === "customer") navigate("/customer");
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    navigate("/", { replace: true });
  };

  const handleDiscoverPhotographers = () => navigate("/discovery");
  const handleViewAllPhotographers = () => navigate("/all-photographers");
  const handleBookPhotographer = (id: string) => navigate("/customer");
  const handleCustomerLogin = () => {
    setRole("customer");
    navigate("/customer");
  };
  const handlePhotographerLogin = () => {
    setRole("photographer");
    navigate("/photographer");
  };

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onBookPhotographer={handleBookPhotographer}
              onDiscoverPhotographers={handleDiscoverPhotographers}
              onViewAllPhotographers={handleViewAllPhotographers}
            />
          }
        />
        <Route
          path="/customer-auth-login"
          element={
            <CustomerAuth
              onLogin={handleCustomerLogin}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/customer-auth-register"
          element={
            <CustomerAuth
              onLogin={handleCustomerLogin}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/photographer-auth-login"
          element={
            <PhotographerAuth
              onLogin={handlePhotographerLogin}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/photographer-auth-register"
          element={
            <PhotographerAuth
              onLogin={handlePhotographerLogin}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/customer"
          element={<CustomerApp onLogout={handleLogout} />}
        />
        <Route
          path="/photographer"
          element={<PhotographerApp onLogout={handleLogout} />}
        />
        <Route
          path="/discovery"
          element={
            <PhotographerDiscovery
              onBookPhotographer={handleBookPhotographer}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/all-photographers"
          element={
            <AllPhotographers
              onBookPhotographer={handleBookPhotographer}
              onBack={() => navigate("/")}
            />
          }
        />
        {/* <Route
          path="/booking-detail-demo"
          element={<BookingDetailDemo onBack={() => navigate("/")} />}
        /> */}
        <Route
          path="/sidebar-demo"
          element={<SidebarDemo onBack={() => navigate("/")} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
