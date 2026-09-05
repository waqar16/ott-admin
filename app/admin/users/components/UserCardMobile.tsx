'use client'

import React from 'react'
import { User } from '@/lib/userApi'
import { AvatarPlaceholder } from './AvatarPlaceholder'
import { RoleBadge } from './RoleBadge'
import { StatusBadge } from './StatusBadge'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

interface UserCardMobileProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export const UserCardMobile: React.FC<UserCardMobileProps> = ({ users, onEdit, onDelete }) => {
  return (
    <div className="md:hidden space-y-3">
      {users.map((user) => {
        const isAdmin = user.role?.toLowerCase() === 'admin'
        return (
          <div
            key={user.id ?? user.email}
            className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <AvatarPlaceholder name={user.name} email={user.email} size="lg" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {user.name || 'Unnamed User'}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge isActive={user.is_active} status={user.status} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(user)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent/80 text-foreground border border-border transition-colors cursor-pointer"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {!isAdmin && (
                  <button
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
