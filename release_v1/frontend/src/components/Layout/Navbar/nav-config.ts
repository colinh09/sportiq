import { Home, Users, Layout, Info } from 'lucide-react';  // Added Info

export interface NavLink {
  type: 'link';
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
}

export type NavItem = NavLink;

export interface NavConfig {
  branding: {
    logo: string;
    text: string;
  };
  leftNav: NavItem[];
  rightNav: NavItem[];
}

export const navConfig: NavConfig = {
  branding: {
    logo: "/SportIQ_Logo.jpg",
    text: "SportIQ"
  },
  leftNav: [], // Empty since we only want logo on left
  rightNav: [
    {
      type: 'link',
      title: 'Home',
      href: '/dashboard',
      icon: Home
    },
    {
      type: 'link',
      title: 'Teams',
      href: '/teams',
      icon: Users
    },
    {
      type: 'link',
      title: 'Modules',
      href: '/modules',
      icon: Layout
    },
    {
      type: 'link',
      title: 'About Us',
      href: '/about',
      icon: Info
    }
  ]
};
