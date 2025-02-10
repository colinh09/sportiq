import React, { useState } from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import type { NavConfig, NavItem } from './nav-config';
import { navConfig } from './nav-config';
import { SearchBar } from '@/components/Layout/Search/SearchBar';
import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface NavbarProps {
  config?: NavConfig;
}

const renderNavItem = (item: NavItem) => {
  return (
    <NavigationMenuItem key={item.href}>
      <Link href={item.href} legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          {item.icon ? (
            <>
              <div className="block xl:hidden">
                <Tooltip>
                  <TooltipTrigger>
                    <item.icon className="h-4 w-4 hidden lg:block xl:hidden" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="hidden xl:block">{item.title}</span>
            </>
          ) : (
            <span>{item.title}</span>
          )}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};

export const Navbar = ({ config = navConfig }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <button 
          className="lg:hidden mr-1 relative z-50" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex w-[75px] items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src={config.branding.logo} alt="Logo" className="h-12 w-12" />
            <span className="font-semibold">{config.branding.text}</span>
          </Link>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
          <div className="w-[365px]">
            {user ? <SearchBar userId={user.id} /> : <SearchBar />}
          </div>
        </div>

        <div className="flex-1 lg:hidden ml-1">
          {user ? <SearchBar userId={user.id} /> : <SearchBar />}
        </div>

        <div className="hidden lg:flex items-center justify-end ml-auto">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center [&>*]:mx-0.5">
              {config.rightNav.map(renderNavItem)}
              {isAuthenticated && (
                <NavigationMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLogout}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "flex items-center text-red-600 hover:text-red-700"
                        )}
                      >
                        <span className="block xl:hidden">
                          <LogOut className="h-4 w-4 hidden lg:block xl:hidden" />
                        </span>
                        <span className="hidden xl:block">Logout</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {isOpen && (
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg lg:hidden z-40">
            <div className="flex flex-col p-4 pt-16 space-y-2">
              {config.rightNav.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  {item.title}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 text-red-600 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
