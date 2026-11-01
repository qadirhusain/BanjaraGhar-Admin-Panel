import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Undo2,
  TicketPercent,
  Images,
  LayoutGrid,
  Star,
  Mail,
  Newspaper,
  Settings,
  ScrollText,
} from 'lucide-react'

// One place for the sidebar and the routes
export const navGroups = [
  {
    label: 'Overview',
    items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Sales',
    items: [
      { path: '/orders', label: 'Orders', icon: ShoppingCart },
      { path: '/returns', label: 'Returns', icon: Undo2 },
      { path: '/coupons', label: 'Coupons', icon: TicketPercent },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { path: '/products', label: 'Products', icon: Package },
      { path: '/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    label: 'Storefront',
    items: [
      { path: '/banners', label: 'Banners', icon: Images },
      { path: '/home-sections', label: 'Home sections', icon: LayoutGrid },
      { path: '/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Customers',
    items: [
      { path: '/messages', label: 'Messages', icon: Mail },
      { path: '/subscribers', label: 'Subscribers', icon: Newspaper },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/activity-log', label: 'Activity log', icon: ScrollText },
    ],
  },
]