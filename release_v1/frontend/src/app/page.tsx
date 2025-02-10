'use client'

import React from 'react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TeamMemberCard } from '@/components/Card/TeamMemberCard';
import { useAuth } from '@/contexts/auth-context';

const teamMembers = [
  {
    name: "Irene",
    role: "CTO",
    image: "/team/Irene.png"
  },
  {
    name: "Nini",
    role: "CEO",
    image: "/team/Nini.png"
  },
  {
    name: "Nidhisha",
    role: "CFO",
    image: "/team/Nidhisha.png"
  },
  {
    name: "Hamza",
    role: "Developer",
    image: "/team/Hamza.png"
  },
  {
    name: "William",
    role: "Developer",
    image: "/team/William.png"
  }
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/SportIQ_Logo.png" 
              alt="SportIQ Logo" 
              className="h-12 hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => router.push('/')}
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <Button 
              variant="outline" 
              className="text-base"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 pt-10">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-start items-center order-2 md:order-1">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-amber-100/50 blur-2xl"></div>
              <img 
                src="/SportIQ_Logo.png"
                alt="Trophy Logo"
                className="relative w-96 hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <div className="space-y-8 order-1 md:order-2">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Your personal sports coach:
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl text-gray-600">
                Learn, play, and enjoy like a pro!
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="text-lg font-medium px-8 py-6 bg-amber-500 hover:bg-amber-600"
                onClick={() => router.push('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Interactive. Real-time.{' '}
              <span className="text-amber-500">Fun</span>
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></span>
                <span className="text-base sm:text-lg text-gray-600">
                  Bite-sized, interactive lessons on baseball basics
                </span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></span>
                <span className="text-base sm:text-lg text-gray-600">
                  Real-time insights and explanations during games
                </span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></span>
                <span className="text-base sm:text-lg text-gray-600">
                  Enhanced enjoyment and deeper fan connections
                </span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-amber-100/50 blur-2xl"></div>
              <img 
                src="/champy/happychampy.png"
                alt="Champy Mascot"
                className="relative w-80 hover:scale-105 transition-transform duration-300 mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* First 3 members */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.slice(0, 3).map((member, index) => (
              <TeamMemberCard
                key={index}
                name={member.name}
                role={member.role}
                image={member.image}
              />
            ))}
          </div>
          
          {/* Last 2 members - centered */}
          <div className="col-span-full flex justify-center gap-8 flex-wrap">
            {teamMembers.slice(3).map((member, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3">
                <TeamMemberCard
                  name={member.name}
                  role={member.role}
                  image={member.image}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}