'use client'

import React from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

type DrawerItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  href?: string
  badge?: boolean | null
  onClick?: () => void
}

type SharedDrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  items: DrawerItem[]
}

export default function SharedDrawer({ open, onClose, title = 'Menu', items }: SharedDrawerProps) {
  return (
    <div className={`fixed inset-0 z-50 transform transition-all duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-80 max-w-sm h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80">
          <button 
            onClick={onClose}
            className="text-xl font-outfit-semibold text-gray-900 hover:text-gray-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            aria-label="Close menu"
          >
            {title}
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 focus:border-0"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="py-1">
          {items.map((item, index) => {
            const MenuItem: any = item.onClick ? 'button' : Link
            const commonProps = item.onClick 
              ? { onClick: () => { item.onClick?.(); onClose(); } }
              : { href: item.href || '#', onClick: onClose }

            return (
              <MenuItem
                key={index}
                {...commonProps}
                className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/80 transition-all duration-200 active:bg-gray-100/80 w-full text-left group ${
                  item.title.toLowerCase() === 'logout' 
                    ? 'text-red-600 hover:bg-red-50/80 active:bg-red-100/80' 
                    : 'text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    item.title.toLowerCase() === 'logout' 
                      ? 'bg-red-100/80 group-hover:bg-red-200/80' 
                      : 'bg-purple-100/80 group-hover:bg-purple-200/80'
                  }`}>
                    <item.icon className={`w-4 h-4 transition-colors duration-200 ${
                      item.title.toLowerCase() === 'logout' ? 'text-red-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <span className="text-sm font-poppins-medium">{item.title}</span>
                </div>
                {item.badge && (
                  <div className="relative">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full w-3 h-3 shadow-lg border border-white animate-pulse"></div>
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </MenuItem>
            )
          })}
        </div>
      </div>
    </div>
  )
}



