"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import useSWR, { mutate } from 'swr';
import { LogOut, ClipboardList, PenTool, ArrowLeft, Moon, Sun, Search, ReceiptText, Megaphone } from 'lucide-react';
import Swal from 'sweetalert2';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

const fetcher = async (url: string, action: string, role: string, student_id?: string) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action, role, student_id })
  });
  const result = await res.json();
  if (result.status !== 'success') throw new Error(result.message);
  return result.data;
};

export default function StaffDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Data states
  const [searchInput, setSearchInput] = useState('');
  const [searchId, setSearchId] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState('');

  // SWR Hook for searching a single student
  const { data: searchResults, error: searchError, isLoading: isSearching } = useSWR(
    (currentUser && activeView === 'students' && searchId) ? [GOOGLE_SCRIPT_URL, 'fetch_data', currentUser.role, searchId] : null,
    ([url, action, role, id]) => fetcher(url, action, role, id),
    { revalidateOnFocus: false }
  );

  const studentData = (searchResults && searchResults.length > 0) ? searchResults.find((s: any) => s.student_id === searchId) : null;

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

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setSearchId(searchInput.trim());
  };

  const handleUpdateBalance = async (targetId: string, currentBalance: number, currentStatus: string) => {
    const { value: amount } = await Swal.fire({
      title: 'Log Transaction',
      input: 'number',
      inputLabel: 'Amount (₱)',
      inputPlaceholder: 'e.g. 500 (use negative for fees)',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'You need to write something!';
      }
    });

    if (!amount) return;

    const { value: description } = await Swal.fire({
      title: 'Transaction Description',
      input: 'text',
      inputLabel: 'Description',
      inputPlaceholder: 'e.g. Tuition Payment',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Please provide a description!';
      }
    });

    if (!description) return;

    const newBalance = Number(currentBalance) - Number(amount);

    const statusSelect = document.getElementById(`status-${targetId}`) as HTMLSelectElement;
    const newStatus = statusSelect ? statusSelect.value : currentStatus;

    try {
      Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add_transaction',
          role: currentUser.role,
          target_id: targetId,
          amount: amount,
          description: description,
          new_balance: newBalance,
          new_status: newStatus
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        mutate([GOOGLE_SCRIPT_URL, 'fetch_data', currentUser.role, searchId]);
        Swal.fire('Success', 'Transaction logged.', 'success');

        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'transaction',
            studentId: targetId,
            amount: amount,
            description: description,
            newBalance: newBalance
          })
        }).catch(console.error);

      } else {
        Swal.fire('Error', result.message, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Network error.', 'error');
    }
  };

  const handlePostAnnouncement = async () => {
    if (!announcementMsg.trim()) {
      Swal.fire('Warning', 'Please enter a message.', 'warning');
      return;
    }

    setIsPosting(true);
    setPostStatus('');

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'post_announcement',
          role: currentUser.role,
          author: currentUser.name || "Staff",
          message: announcementMsg.trim()
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setAnnouncementMsg('');
        setPostStatus('Announcement posted successfully!');
        
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'announcement',
            author: currentUser.name || "Staff",
            message: announcementMsg.trim()
          })
        }).catch(console.error);
        
      } else {
        setPostStatus("Error: " + result.message);
      }
    } catch (error) {
      setPostStatus("Network error while posting.");
    } finally {
      setIsPosting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center font-sans transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300 text-gray-900 dark:text-gray-100">
      
      {/* Navbar */}
      <nav className="bg-[#ea580c] dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50 border-b border-transparent dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 mr-3 text-orange-200" />
              <span className="font-bold text-xl tracking-tight">Staff Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-orange-700 dark:bg-gray-800 rounded-lg hover:bg-orange-600 dark:hover:bg-gray-700 transition-colors">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <span className="text-sm font-medium hidden sm:block">Welcome, {currentUser.name || 'Staff'}</span>
              <button 
                onClick={handleLogout}
                className="bg-orange-700 dark:bg-gray-800 hover:bg-orange-600 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-inner"
              >
                <LogOut size={16} className="mr-2 hidden sm:block" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* DASHBOARD GRID */}
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in max-w-4xl mx-auto">
            
            <div onClick={() => setActiveView('students')} className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-orange-50 dark:bg-orange-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                <PenTool size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">Student Records</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Search for a student to view their profile, update balances, and log transactions.</p>
              <button className="text-orange-600 dark:text-orange-400 font-semibold text-sm group-hover:text-orange-800 transition-colors">Look up student &rarr;</button>
            </div>

            <div onClick={() => setActiveView('announcements')} className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-green-50 dark:bg-green-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <Megaphone size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">Announcements</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Post important announcements and updates to all portals.</p>
              <button className="text-green-600 dark:text-green-400 font-semibold text-sm group-hover:text-green-800 transition-colors">Post Announcement &rarr;</button>
            </div>

          </div>
        )}

        {/* STUDENTS VIEW */}
        {activeView === 'students' && (
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in max-w-4xl mx-auto">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Search className="mr-3 text-orange-600 dark:text-orange-400" size={24} /> Student Lookup
            </h2>
            
            <div className="flex space-x-2 mb-8">
              <input 
                type="text" 
                placeholder="Enter Student ID (e.g. 2025-151)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center disabled:opacity-70"
              >
                {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Search'}
              </button>
            </div>

            {searchId && !isSearching && !studentData && !searchError && (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                Student ID <b>{searchId}</b> not found in database.
              </div>
            )}

            {isSearching && (
              <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            )}

            {studentData && !isSearching && (
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{studentData.name || 'No Name Provided'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">ID: {studentData.student_id} • Contact: {studentData.contact || 'N/A'}</p>
                  </div>
                  <div className="mt-4 md:mt-0 bg-white dark:bg-[#111] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Current Balance</span>
                    <span className="block text-2xl font-bold text-orange-600 dark:text-orange-400">₱{studentData.balance || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#111] p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select 
                      id={`status-${studentData.student_id}`}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      defaultValue={studentData.status_val || 'Pending'}
                    >
                      <option className="text-black" value="Pending">Pending</option>
                      <option className="text-black" value="Paid">Paid</option>
                      <option className="text-black" value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button 
                      id={`savebtn-${studentData.student_id}`}
                      onClick={() => handleUpdateBalance(studentData.student_id, studentData.balance, studentData.status_val)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                    >
                      <ReceiptText size={18} className="mr-2" /> Log Transaction
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS VIEW */}
        {activeView === 'announcements' && (
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in max-w-3xl">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Megaphone className="mr-3 text-green-600 dark:text-green-400" size={28} /> Post Announcement
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Write an announcement below. It will instantly appear on the Student Portal feed and email students.</p>
            
            <div className="space-y-4">
              <textarea 
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-40 p-4 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-y"
              ></textarea>
              
              <button 
                onClick={handlePostAnnouncement}
                disabled={isPosting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center disabled:opacity-70 w-full sm:w-auto justify-center"
              >
                {isPosting ? 'Posting...' : 'Post & Email Students'}
              </button>
              
              {postStatus && (
                <p className={`mt-2 font-medium ${postStatus.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {postStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
