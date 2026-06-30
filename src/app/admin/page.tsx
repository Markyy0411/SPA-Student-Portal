"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Users, Settings, Database, ShieldCheck, DatabaseBackup } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/');
    } else {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        setCurrentUser(user);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-blue-200" />
              <span className="font-bold text-xl tracking-tight">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium hidden sm:block">Welcome, {currentUser.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-inner"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Users size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-500 text-sm mb-4">View, edit, or remove student and staff accounts. Reset passwords.</p>
            <button className="text-blue-600 font-semibold text-sm hover:text-blue-800">Manage Users &rarr;</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-purple-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-purple-600">
              <Database size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Database Setup</h2>
            <p className="text-gray-500 text-sm mb-4">Configure Supabase connection strings, manage tables and schemas.</p>
            <button className="text-purple-600 font-semibold text-sm hover:text-purple-800">Go to Supabase &rarr;</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-green-600">
              <DatabaseBackup size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Migration Tools</h2>
            <p className="text-gray-500 text-sm mb-4">Sync data from legacy Google Sheets into the new SQL database.</p>
            <button className="text-green-600 font-semibold text-sm hover:text-green-800">Start Migration &rarr;</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-gray-600">
              <Settings size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">System Settings</h2>
            <p className="text-gray-500 text-sm mb-4">Configure global portal settings, maintenance mode, and logs.</p>
            <button className="text-gray-600 font-semibold text-sm hover:text-gray-800">View Settings &rarr;</button>
          </div>

        </div>
      </main>
    </div>
  );
}
