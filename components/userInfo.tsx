'use client'

import { LogOut, UserCircle } from 'lucide-react'

type UserInfoProps = {
    username: string
    onLogout: () => void
}

export default function UserInfo({ username, onLogout }: UserInfoProps) {
    return (
        <div className="flex items-center gap-4 p-2 rounded-xl bg-white shadow-sm border">
            <UserCircle className="w-8 h-8 text-gray-600" />

            <div className="flex-1">
                <p className="text-xs text-gray-500">Welcome</p>
                <p className="text-base font-medium text-gray-900">{username}</p>
            </div>

            <button
                onClick={onLogout}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition cursor-pointer"
            >
                <LogOut className="w-5 h-5" />
                Logout
            </button>
        </div>
    )
}
