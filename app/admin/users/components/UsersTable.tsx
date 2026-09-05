'use client'

import React from 'react'
import { User } from '@/lib/userApi'
import { AvatarPlaceholder } from './AvatarPlaceholder'
import { RoleBadge } from './RoleBadge'
import { StatusBadge } from './StatusBadge'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

interface UsersTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete }) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-md">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((user) => {
              const isAdmin = user.role?.toLowerCase() === 'admin'
              return (
                <tr
                  key={user.id ?? user.email}
                  className="hover:bg-accent/40 transition-colors duration-150 group"
                >
                  {/* User Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <AvatarPlaceholder name={user.name} email={user.email} size="md" />
                      <div>
                        <span className="font-semibold text-foreground block group-hover:text-primary transition-colors">
                          {user.name || 'Unnamed User'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">ID: #{user.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4">
                    <span className="text-muted-foreground text-xs font-mono">{user.email}</span>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge isActive={user.is_active} status={user.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                        title="Edit User"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>

                      {!isAdmin && (
                        <button
                          onClick={() => onDelete(user)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
