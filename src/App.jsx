import React from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MojaPonuka from './pages/MojaPonuka.jsx';
import MojeKonto from './pages/MojeKonto';
import Kalkulacka from './pages/Kalkulacka';
import AdminMojeKonto from './pages/AdminMojeKonto';
import { createPageUrl } from '@/utils';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutRoute = () => Layout ?
  <Layout><Outlet /></Layout>
  : <Outlet />;

const RouteRedirect = ({ to }) => {
  const location = useLocation();
  return <Navigate to={{ pathname: to, search: location.search }} replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<LayoutRoute />}>
        <Route path="/" element={<MainPage />} />
        {Object.entries(Pages).map(([pathKey, Page]) => {
          const kebabPath = createPageUrl(pathKey);
          const originalPath = `/${pathKey}`;
          const needsRedirect = kebabPath !== originalPath;

          return (
            <React.Fragment key={pathKey}>
              <Route path={kebabPath} element={<Page />} caseSensitive />
              {needsRedirect && (
                <Route path={originalPath} element={<RouteRedirect to={kebabPath} />} />
              )}
            </React.Fragment>
          );
        })}
        <Route path="/lokalita/:slug" element={<Pages.LokaciaDetail />} />
        <Route path="/blog/:slug" element={<Pages.BlogDetail />} />
        <Route path="/moje-konto" element={<MojeKonto />} caseSensitive />
        <Route path="/MojeKonto" element={<RouteRedirect to="/moje-konto" />} />
        <Route path="/MojaPonuka/:id" element={<MojaPonuka />} />
        <Route path="/admin-moje-konto" element={<AdminMojeKonto />} caseSensitive />
        <Route path="/AdminMojeKonto" element={<RouteRedirect to="/admin-moje-konto" />} />
      </Route>
      <Route path="/zna-p/ticabhouse" element={<RouteRedirect to="/katalog" />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};



function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App