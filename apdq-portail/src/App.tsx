import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { CircularProgress, Box } from '@mui/material';
import Login from './views/loginPage';
import Dashboard from './views/dashboard';
import { AuthProvider, useAuth } from './hooks/authContext';
import { ProtectedRouteProps, PublicRouteProps } from './interface/interface';
import { useEffect } from 'react';
import i18n from './i18n';

// Create a consistent theme for the entire application
const theme = createTheme({
  palette: {
    primary: {
      main: '#14B8A6', // Main brand color (teal)
      light: '#16A34A', // Light variant (green)
      dark: '#0F766E', // Dark variant (dark teal)
    },
    background: {
      default: '#F3F4F6', // Light gray background
    },
  },
  typography: {
    fontFamily: ['Poppins'].join(','),
    h5: {
      fontWeight: 600, // Semi-bold headings
    },
    body1: {
      fontWeight: 400, // Regular body text
    },
    body2: {
      fontWeight: 400, // Secondary body text
    },
  },
});

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ensure public routes have language parameter
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0 || !['en', 'fr'].includes(pathSegments[0])) {
      navigate(`/${i18n.language}${location.pathname}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? (
    <Navigate to={`/dashboard/${i18n.language}`} replace />
  ) : (
    <>{children}</>
  );
};

// Enhanced ProtectedRoute to handle language routing
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure protected routes have language parameter
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (
      pathSegments[0] === 'dashboard' &&
      (!pathSegments[1] || !['en', 'fr'].includes(pathSegments[1]))
    ) {
      const newPath = `/dashboard/${i18n.language}${pathSegments
        .slice(1)
        .join('/')}`;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || (requiredRole && role?.name !== requiredRole)) {
    return (
      <Navigate to={`/${i18n.language}`} state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
};

// Component that manages all application routes
// Uses authentication state to determine routing behavior
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Global route handler for language parameters
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Special handling for root path
    if (pathSegments.length === 0) {
      navigate(`/${i18n.language}`, { replace: true });
      return;
    }

    // Handle language changes in the URL
    if (pathSegments[0] === 'dashboard') {
      const currentLang = pathSegments[1];
      if (currentLang && ['en', 'fr'].includes(currentLang)) {
        // Sync i18n with URL language
        if (i18n.language !== currentLang) {
          i18n.changeLanguage(currentLang);
        }
      } else {
        // Add language parameter if missing
        const newPath = `/dashboard/${i18n.language}/${pathSegments
          .slice(1)
          .join('/')}`;
        navigate(newPath, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      {/* Login route with language parameter */}
      <Route
        path='/:lang'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Dashboard routes with language parameter */}
      <Route
        path='/dashboard/:lang'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/dashboard/:lang/:view'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Root route - redirects based on authentication status with language */}
      <Route
        path='/'
        element={
          <Navigate
            to={
              isAuthenticated
                ? `/dashboard/${i18n.language}`
                : `/${i18n.language}`
            }
            replace
          />
        }
      />
      {/* Catch all route for unmatched paths - preserves authentication status and language */}
      <Route
        path='*'
        element={
          <Navigate
            to={
              isAuthenticated
                ? `/dashboard/${i18n.language}`
                : `/${i18n.language}`
            }
            replace
          />
        }
      />
    </Routes>
  );
}
// Main application component that sets up providers and routing
function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
