// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Package,
//   Image,
//   Users,
//   Settings,
//   ChevronRight,
//   Home,
// } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';

// interface SidebarProps {
//   onClose?: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
//   const { user } = useAuth();

//   const navigation = [
//     { name: 'Dashboard', href: '/', icon: LayoutDashboard },
//     { name: 'Products', href: '/products', icon: Package },
//     { name: 'Categories', href: '/categories', icon: ChevronRight },
//     { name: 'Images', href: '/images', icon: Image },
//     { name: 'Users', href: '/users', icon: Users },
//     { name: 'Settings', href: '/settings', icon: Settings },
//   ];

//   const handleNavClick = () => {
//     if (onClose && window.innerWidth < 768) {
//       onClose();
//     }
//   };

//   return (
//     <div className="h-full flex flex-col">
//       {/* Logo */}
//       <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex items-center space-x-3">
//           <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
//             <Home className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Admin Panel
//             </h1>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               Management Console
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* User info */}
//       <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex items-center space-x-3">
//           <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//             <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
//               {user?.name?.charAt(0) || 'A'}
//             </span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//               {user?.name || 'Administrator'}
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//               {user?.email || 'admin@example.com'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
//         {navigation.map((item) => {
//           const Icon = item.icon;
//           return (
//             <NavLink
//               key={item.name}
//               to={item.href}
//               onClick={handleNavClick}
//               className={({ isActive }) =>
//                 `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
//                   isActive
//                     ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
//                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`
//               }
//               end
//             >
//               <Icon className="h-5 w-5 mr-3" />
//               {item.name}
//             </NavLink>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//         <div className="px-3">
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             Version 1.0.0
//           </p>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Last updated: Today
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Image,
  ShoppingBag,
  Settings,
  Home,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Banners', href: '/banners', icon: Image },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Management Console
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
              end
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="px-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Version 1.0.0
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: Today
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;