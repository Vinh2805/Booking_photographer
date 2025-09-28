import { useState, Suspense, lazy } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";

// ✅ Lazy load tất cả component
const CustomerApp = lazy(() =>
    import("./components/CustomerApp").then((module) => ({
        default: module.CustomerApp,
    }))
);
const PhotographerApp = lazy(() =>
    import("./components/PhotographerApp").then((module) => ({
        default: module.PhotographerApp,
    }))
);
const LandingPage = lazy(() =>
    import("./components/LandingPage").then((module) => ({
        default: module.LandingPage,
    }))
);
const PhotographerDiscovery = lazy(() =>
    import("./components/PhotographerDiscovery").then((module) => ({
        default: module.PhotographerDiscovery,
    }))
);
const AllPhotographers = lazy(() =>
    import("./components/AllPhotographers").then((module) => ({
        default: module.AllPhotographers,
    }))
);
const CustomerAuth = lazy(() =>
    import("./components/customer/CustomerAuth").then((module) => ({
        default: module.CustomerAuth,
    }))
);
const PhotographerAuth = lazy(() =>
    import("./components/photographer/PhotographerAuth").then((module) => ({
        default: module.PhotographerAuth,
    }))
);
const BookingDetailDemo = lazy(() =>
    import("./components/BookingDetailDemo").then((module) => ({
        default: module.BookingDetailDemo,
    }))
);
const SidebarDemo = lazy(() =>
    import("./components/SidebarDemo").then((module) => ({
        default: module.SidebarDemo,
    }))
);

// Loading component
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

    const handleDiscoverPhotographers = () => {
        navigate("/discovery");
    };

    const handleViewAllPhotographers = () => {
        navigate("/all-photographers");
    };

    const handleBookPhotographer = (photographerId: string) => {
        console.log("Booking photographer:", photographerId);
        navigate("/customer");
    };

    const [customerAuth, setCustomerAuth] = useState(false);
    const [photographerAuth, setPhotographerAuth] = useState(false);

    const handleCustomerLogin = () => {
        setCustomerAuth(true);
        navigate("/customer");
    };

    const handlePhotographerLogin = () => {
        setPhotographerAuth(true);
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
                            onDiscoverPhotographers={
                                handleDiscoverPhotographers
                            }
                            onViewAllPhotographers={handleViewAllPhotographers}
                        />
                    }
                />
                <Route
                    path="/customer"
                    element={<CustomerApp onBack={() => navigate("/")} />}
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
                            onLogin={() => navigate("/customer-auth-login")}
                            onBack={() => navigate("/")}
                        />
                    }
                />
                <Route
                    path="/photographer"
                    element={<PhotographerApp onBack={() => navigate("/")} />}
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
                            onLogin={() => navigate("/photographer-auth-login")}
                            onBack={() => navigate("/")}
                        />
                    }
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
                <Route
                    path="/sidebar-demo"
                    element={<SidebarDemo onBack={() => navigate("/")} />}
                />
                <Route
                    path="/booking-detail-demo"
                    element={<BookingDetailDemo onBack={() => navigate("/")} />}
                />
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
