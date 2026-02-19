import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/guards/AuthGuard';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingSpinner from './components/shared/LoadingSpinner';
import Layout from './components/layout/Layout';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/products/Products'));
const ProductEdit = lazy(() => import('./pages/products/ProductEdit'));
const Categories = lazy(() => import('./pages/categories/Categories'));
const CategoryEdit = lazy(() => import('./pages/categories/CategoryEdit'));
const Banners = lazy(() => import('./pages/banners/Banners'));
const BannerEdit = lazy(() => import('./pages/banners/BannerEdit'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading application..." />
            </div>
          }>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={
                <AuthGuard requireAuth={false}>
                  <LoginPage />
                </AuthGuard>
              } />
              
               {/* Protected Routes */}
               <Route path="/" element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }>
                <Route index element={<Dashboard />} />
                
                {/* Products */}
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<ProductEdit />} />
                <Route path="products/:id" element={<ProductEdit />} />
                
                {/* Categories */}
                 <Route path="categories" element={<Categories />} />
                <Route path="categories/new" element={<CategoryEdit />} />
                <Route path="categories/:id" element={<CategoryEdit />} /> 
                
                {/* Banners */}
                 <Route path="banners" element={<Banners />} />
                <Route path="banners/new" element={<BannerEdit />} />
                <Route path="banners/:id" element={<BannerEdit />} /> 
                
                {/* Orders */}
                 <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} /> 
                
                {/* Account */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} /> 
              </Route>
              
              {/* Catch all route - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;

