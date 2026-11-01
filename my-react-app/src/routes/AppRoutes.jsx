import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import LoginPage from '@/pages/login/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import CategoriesPage from '@/pages/categories/CategoriesPage'
import ProductsPage from '@/pages/products/ProductsPage'
import ProductFormPage from '@/pages/products/ProductFormPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import OrderDetailPage from '@/pages/orders/OrderDetailPage'
import ReturnsPage from '@/pages/returns/ReturnsPage'
import ComingSoonPage from '@/pages/ComingSoonPage'
import NotFoundPage from '@/pages/NotFoundPage'
import CouponsPage from '@/pages/coupons/CouponsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import BannersPage from '@/pages/banners/BannersPage'
import HomeSectionsPage from '@/pages/homeSections/HomeSectionsPage'
import ReviewsPage from '@/pages/reviews/ReviewPage'
import MessagesPage from '@/pages/messages/MessagePage'
import SubscribersPage from '@/pages/subscribers/SubscribersPage'
import ActivityLogPage from '@/pages/activityLog/ActivityLogPage'
import { navGroups } from '@/routes/navItems'

const navItems = navGroups.flatMap((group) => group.items)

// Pages that are built. Everything else shows the "coming soon" placeholder.
const pages = {
  '/dashboard': <DashboardPage />,
  '/orders': <OrdersPage />,
  '/returns': <ReturnsPage />,
  '/coupons': <CouponsPage />,
  '/categories': <CategoriesPage />,
  '/products': <ProductsPage />,
  '/settings': <SettingsPage />,
  '/banners': <BannersPage />,
  '/home-sections': <HomeSectionsPage />,
  '/reviews': <ReviewsPage />,
  '/messages': <MessagesPage />,
  '/subscribers': <SubscribersPage />,
  '/activity-log': <ActivityLogPage />,
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {navItems.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={pages[item.path] ?? <ComingSoonPage title={item.label} />}
            />
          ))}
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/products/new" element={<ProductFormPage key="new" />} />
          <Route path="/products/:id/edit" element={<ProductFormPage key="edit" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}