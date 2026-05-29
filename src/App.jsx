import React from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import Layout from './Layout.jsx'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MojaPonuka from './pages/MojaPonuka.jsx';
import MojeKonto from './pages/MojeKonto';
import Kalkulacka from './pages/Kalkulacka';
import AdminMojeKonto from './pages/AdminMojeKonto';
import { createPageUrl } from '@/utils';

// Dynamické vyhľadanie všetkých stránok bez statických importov
const pages = import.meta.glob('./pages/*.jsx');

// Cache pre asynchrónne načítavané komponenty
const lazyPagesCache = {};
const getLazyPage = (pathKey) => {
  const globPath = `./pages/${pathKey}.jsx`;
  if (pages[globPath]) {
    if (!lazyPagesCache[pathKey]) {
      lazyPagesCache[pathKey] = React.lazy(pages[globPath]);
    }
    return lazyPagesCache[pathKey];
  }
  if (!lazyPagesCache[pathKey]) {
    lazyPagesCache[pathKey] = React.lazy(() => import(`./pages/${pathKey}.jsx`));
  }
  return lazyPagesCache[pathKey];
};

const mainPageKey = "Domov";
const MainPage = () => {
  const LazyComp = getLazyPage(mainPageKey);
  return <LazyComp />;
};

const LokaciaDetail = () => {
  const LazyComp = getLazyPage('LokaciaDetail');
  return <LazyComp />;
};

const BlogDetail = () => {
  const LazyComp = getLazyPage('BlogDetail');
  return <LazyComp />;
};

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
        {Object.keys(pages).map((path) => {
          const match = path.match(/\/([^/]+)\.jsx$/);
          const pathKey = match ? match[1] : null;
          if (!pathKey) return null;

          const kebabPath = createPageUrl(pathKey);
          const originalPath = `/${pathKey}`;
          const needsRedirect = kebabPath !== originalPath;
          const Page = getLazyPage(pathKey);

          return (
            <React.Fragment key={pathKey}>
              <Route path={kebabPath} element={<Page />} caseSensitive />
              {needsRedirect && (
                <Route path={originalPath} element={<RouteRedirect to={kebabPath} />} />
              )}
            </React.Fragment>
          );
        })}
        <Route path="/lokalita/:slug" element={<LokaciaDetail />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
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
          <React.Suspense fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm z-50 transition-all duration-300">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 dark:border-t-slate-200 rounded-full animate-spin"></div>
            </div>
          }>
            <AuthenticatedApp />
          </React.Suspense>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App