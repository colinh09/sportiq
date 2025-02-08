"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import ChatRoom from '@/components/Chat/ChatRoom'
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/Layout/Navbar/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
    </>
  )
}