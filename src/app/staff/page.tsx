"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ClipboardList, PenTool, CreditCard, ArrowLeft, Loader2, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

export default function StaffDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Data states
  const [searchId, setSearchId] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState('');

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

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearching(true);
    setStudentData(null);

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'fetch_data',
          role: currentUser.role,
          student_id: searchId.trim()
        })
      });
      const result = await response.json();
      if (result.status === 'success' && result.data.length > 0) {
        const sData = result.data.find((s: any) => s.student_id === searchId.trim());
        if (sData) {
          setStudentData(sData);
        } else {
          Swal.fire('Not Found', 'Student ID not found.', 'info');
        }
      } else {
        Swal.fire('Not Found', 'Student ID not found.', 'info');
      }
    } catch (error) {
      Swal.fire('Error', 'Network error while searching.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateStudent = async (targetId: string, currentBalance: number, currentStatus: string) => {
    const balanceInput = document.getElementById(`balance-${targetId}`) as HTMLInputElement;
    const statusSelect = document.getElementById(`status-${targetId}`) as HTMLSelectElement;
    const saveBtn = document.getElementById(`savebtn-${targetId}`) as HTMLButtonElement;
    
    if (!balanceInput || !statusSelect || !saveBtn) return;

    const newBalance = balanceInput.value;
    const newStatus = statusSelect.value;
    
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'edit_data',
          role: currentUser.role,
          target_id: targetId,
          new_balance: newBalance,
          new_status: newStatus
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        saveBtn.innerText = "Saved ✓";
        saveBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
        saveBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        setTimeout(() => {
          saveBtn.innerText = "Save Changes";
          saveBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
          saveBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
          saveBtn.disabled = false;
        }, 2000);
      } else {
        Swal.fire('Error', result.message, 'error');
        saveBtn.innerText = "Save Changes";
        saveBtn.disabled = false;
      }
    } catch (error) {
      Swal.fire('Error', 'Network error.', 'error');
      saveBtn.innerText = "Save Changes";
      saveBtn.disabled = false;
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
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
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
      } else {
        setPostStatus("Error: " + result.message);
      }
    } catch (error) {
      setPostStatus("Network error while posting.");
    } finally {
      setIsPosting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar (The Orange Header) */}
      <nav className="bg-[#ea580c] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 mr-3 text-orange-200" />
              <span className="font-bold text-xl tracking-tight">Staff Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium hidden sm:block">Hello, {currentUser.name || 'Staff'}</span>
              <button 
                onClick={handleLogout}
                className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-inner"
              >
                <LogOut size={16} className="mr-2 hidden sm:block" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* MAIN DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in max-w-4xl">
            
            <div onClick={() => setActiveView('search')} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500 cursor-pointer group">
              <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                <CreditCard size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Update Balances</h2>
              <p className="text-gray-500 text-sm mb-4">Record payments and update student outstanding balances.</p>
              <button className="text-orange-600 font-semibold text-sm group-hover:text-orange-800 transition-colors">Search Student &rarr;</button>
            </div>

            <div onClick={() => setActiveView('announcements')} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-500 cursor-pointer group">
              <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                <PenTool size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Post Announcements</h2>
              <p className="text-gray-500 text-sm mb-4">Create, edit, or delete public announcements for students.</p>
              <button className="text-orange-600 font-semibold text-sm group-hover:text-orange-800 transition-colors">New Announcement &rarr;</button>
            </div>

          </div>
        )}

        {/* SEARCH STUDENT VIEW */}
        {activeView === 'search' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in max-w-3xl border-l-4 border-l-orange-500">
            <button 
              onClick={() => { setActiveView('dashboard'); setStudentData(null); setSearchId(''); }}
              className="text-gray-500 hover:text-gray-800 font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Search className="mr-3 text-orange-600" size={28} /> Search Student
            </h2>
            <p className="text-gray-600 mb-6">Enter a Student ID to view and edit their records.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mb-8">
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. 2025-151" 
                className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isSearching ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {studentData && (
              <div className="bg-orange-50/50 p-6 sm:p-8 rounded-xl border border-orange-100 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 border-b border-orange-200 pb-3 mb-4">Student Record Found</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6 text-sm sm:text-base">
                  <div>
                    <span className="text-gray-500 block text-sm">Student ID</span>
                    <strong className="text-gray-900 text-lg">{studentData.student_id}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Name</span>
                    <strong className="text-gray-900 text-lg">{studentData.name || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Grade/Section</span>
                    <strong className="text-gray-900">{studentData.section || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Contact</span>
                    <strong className="text-gray-900">{studentData.contact || 'No record'}</strong>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm mt-4">
                  <h4 className="font-semibold text-gray-700 mb-4">Update Financial Status</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Outstanding Balance (₱)</label>
                      <input 
                        type="number" 
                        id={`balance-${studentData.student_id}`}
                        defaultValue={studentData.balance || 0}
                        className="w-full p-2.5 border border-gray-300 rounded outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Status</label>
                      <select 
                        id={`status-${studentData.student_id}`}
                        defaultValue={studentData.status_val || 'Pending'}
                        className="w-full p-2.5 border border-gray-300 rounded outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    id={`savebtn-${studentData.student_id}`}
                    onClick={() => handleUpdateStudent(studentData.student_id, studentData.balance, studentData.status_val)}
                    className="mt-5 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-8 rounded transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS VIEW */}
        {activeView === 'announcements' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in max-w-3xl border-l-4 border-l-orange-500">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <PenTool className="mr-3 text-orange-600" size={28} /> Post Announcement
            </h2>
            <p className="text-gray-600 mb-6">Write an announcement below. It will instantly appear on the Student Portal feed.</p>
            
            <div className="space-y-4">
              <label className="block font-semibold text-gray-800 mb-1">Announcement Message:</label>
              <textarea 
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-y"
              ></textarea>
              
              <button 
                onClick={handlePostAnnouncement}
                disabled={isPosting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center disabled:opacity-70 w-full sm:w-auto justify-center"
              >
                {isPosting ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                {isPosting ? 'Posting...' : 'Post to Feed'}
              </button>
              
              {postStatus && (
                <p className={`mt-2 font-medium ${postStatus.includes('Error') ? 'text-red-600' : 'text-orange-600'}`}>
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
