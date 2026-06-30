"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ClipboardList, PenTool, MessageSquare, CreditCard } from 'lucide-react';

export default function StaffDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/');
    } else {
      const user = JSON.parse(userStr);
      if (user.role !== 'staff') {
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
      <nav className="bg-orange-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 mr-3 text-orange-200" />
              <span className="font-bold text-xl tracking-tight">Staff Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium hidden sm:block">Hello, {currentUser.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-inner"
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
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-orange-600">
              <CreditCard size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Update Balances</h2>
            <p className="text-gray-500 text-sm mb-4">Record payments and update student outstanding balances.</p>
            <button className="text-orange-600 font-semibold text-sm hover:text-orange-800">Manage Payments &rarr;</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-orange-600">
              <PenTool size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Post Announcements</h2>
            <p className="text-gray-500 text-sm mb-4">Create, edit, or delete public announcements for students.</p>
            <button className="text-orange-600 font-semibold text-sm hover:text-orange-800">New Announcement &rarr;</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-orange-600">
              <MessageSquare size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Student Requests</h2>
            <p className="text-gray-500 text-sm mb-4">View and respond to document requests and inquiries.</p>
            <button className="text-orange-600 font-semibold text-sm hover:text-orange-800">View Requests &rarr;</button>
          </div>

        </div>
      </main>
    </div>
  );
}
