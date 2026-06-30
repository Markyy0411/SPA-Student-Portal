"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Bullhorn, LogOut, ArrowLeft, Loader2, UserCheck, Search } from 'lucide-react';
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

  // Authentication check
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
        saveBtn.style.backgroundColor = "#1b5e20";
        setTimeout(() => {
          saveBtn.innerText = "Save Changes";
          saveBtn.style.backgroundColor = "";
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
    <div className="min-h-screen font-sans relative overflow-x-hidden text-gray-800">
      <div className="fixed inset-0 bg-[url('/bghome.jpg')] bg-cover bg-center bg-fixed -z-10"></div>

      <div className="max-w-5xl mx-auto my-10 sm:my-20 px-4">
        <div className="bg-white/90 backdrop-blur-[15px] rounded-[20px] p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] min-h-[500px]">
          
          <button 
            onClick={handleLogout}
            className="float-right bg-[#ff4d4d] hover:bg-[#e60000] text-white font-semibold py-2 px-4 sm:px-5 rounded-lg transition-colors text-sm sm:text-base"
          >
            Logout
          </button>

          {/* MAIN DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="animate-fade-in mt-12 sm:mt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#008751] mb-2 flex items-center">
                <UserCheck className="mr-3" size={32} /> Staff Dashboard
              </h1>
              <p className="text-gray-700">Welcome, <span className="font-semibold">{currentUser.name || 'Staff'}</span>. Manage students and post announcements here.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8 max-w-2xl">
                <div 
                  onClick={() => setActiveView('search')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <Search size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Search Student</h3>
                  <p className="text-gray-600 text-sm">Find a student to update their balance and status.</p>
                </div>

                <div 
                  onClick={() => setActiveView('announcements')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <Bullhorn size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Post Announcement</h3>
                  <p className="text-gray-600 text-sm">Post updates to the Student Portal feed.</p>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH STUDENT VIEW */}
          {activeView === 'search' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => { setActiveView('dashboard'); setStudentData(null); setSearchId(''); }}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <Search className="mr-3" size={28} /> Search Student
              </h2>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">Enter a Student ID to view and edit their records.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mb-8">
                <input 
                  type="text" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. 2025-151" 
                  className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:border-[#008751]"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-[#008751] hover:bg-[#00683f] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isSearching ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {studentData && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border-l-4 border-[#008751] max-w-2xl animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Student Record Found</h3>
                  
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

                  <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Update Financial Status</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Outstanding Balance (₱)</label>
                        <input 
                          type="number" 
                          id={`balance-${studentData.student_id}`}
                          defaultValue={studentData.balance || 0}
                          className="w-full p-2.5 border border-gray-300 rounded outline-none focus:border-[#008751]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Status</label>
                        <select 
                          id={`status-${studentData.student_id}`}
                          defaultValue={studentData.status_val || 'Pending'}
                          className="w-full p-2.5 border border-gray-300 rounded outline-none focus:border-[#008751]"
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
                      className="mt-5 w-full sm:w-auto bg-[#008751] hover:bg-[#00683f] text-white font-semibold py-2.5 px-8 rounded transition-colors"
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
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <Bullhorn className="mr-3" size={28} /> Post Announcement
              </h2>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">Write an announcement below. It will instantly appear on the Student Portal feed.</p>
              
              <div className="max-w-2xl">
                <label className="block font-semibold mb-2">Announcement Message:</label>
                <textarea 
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] resize-y mb-4"
                ></textarea>
                
                <button 
                  onClick={handlePostAnnouncement}
                  disabled={isPosting}
                  className="bg-[#10af33] hover:bg-[#0c9c2c] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-70"
                >
                  {isPosting ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                  {isPosting ? 'Posting...' : 'Post to Feed'}
                </button>
                
                {postStatus && (
                  <p className={`mt-4 font-medium text-center sm:text-left ${postStatus.includes('Error') ? 'text-red-500' : 'text-[#008751]'}`}>
                    {postStatus}
                  </p>
                )}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
