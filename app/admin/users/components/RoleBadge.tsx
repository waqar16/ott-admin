'use client'

import React from 'react'
import { FiShield, FiUser, FiCode, FiVideo } from 'react-icons/fi'

interface RoleBadgeProps {
  role?: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role = 'user' }) => {
  const normalizedRole = role.toLowerCase().trim()

  const roleStyles: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
    admin: {
      bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      icon: FiShield,
      label: 'Admin',
    },
    user: {
      bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      icon: FiUser,
      label: 'User',
    },
    beta_tester: {
      bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: FiCode,
      label: 'Tester',
    },
    creator: {
      bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      icon: FiVideo,
      label: 'Creator',
    },
  }

  const config = roleStyles[normalizedRole] || {
    bg: 'bg-accent text-accent-foreground border-border',
    icon: FiUser,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  }

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  )
}
