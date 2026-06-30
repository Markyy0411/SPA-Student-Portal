"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Bullhorn, Settings, LogOut, ArrowLeft, Loader2, UserShield } from 'lucide-react';
import Swal from 'sweetalert2';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
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

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'fetch_data',
          role: currentUser.role,
          student_id: currentUser.student_id
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        // Filter out empty rows and non-students
        setUsers(result.data.filter((u: any) => u.student_id && u.role === 'student'));
      } else {
        Swal.fire('Error', result.message || 'Could not load data', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Network error while loading data', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdateUser = async (targetId: string, currentBalance: number, currentStatus: string) => {
    const tr = document.getElementById(`row-${targetId}`);
    const balanceInput = tr?.querySelector('.balance-input') as HTMLInputElement;
    const statusSelect = tr?.querySelector('.status-select') as HTMLSelectElement;
    const saveBtn = tr?.querySelector('.save-btn') as HTMLButtonElement;
    
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
          saveBtn.innerText = "Save";
          saveBtn.style.backgroundColor = "";
          saveBtn.disabled = false;
        }, 2000);
      } else {
        Swal.fire('Error', result.message, 'error');
        saveBtn.innerText = "Save";
        saveBtn.disabled = false;
      }
    } catch (error) {
      Swal.fire('Error', 'Network error.', 'error');
      saveBtn.innerText = "Save";
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
          author: currentUser.name || "Administrator",
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

      <div className="max-w-5xl mx-auto my-20 px-4">
        <div className="bg-white/90 backdrop-blur-[15px] rounded-[20px] p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] min-h-[500px]">
          
          <button 
            onClick={handleLogout}
            className="float-right bg-[#ff4d4d] hover:bg-[#e60000] text-white font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            Logout
          </button>

          {/* MAIN DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-[#008751] mb-2 flex items-center">
                <UserShield className="mr-3" size={32} /> Admin Dashboard
              </h1>
              <p className="text-gray-700">Welcome, <span className="font-semibold">{currentUser.name || 'Administrator'}</span>. You have full system access.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                <div 
                  onClick={() => { setActiveView('users'); loadUsers(); }}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <Users size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
                  <p className="text-gray-600 text-sm">View students and securely edit their balances.</p>
                </div>

                <div 
                  onClick={() => setActiveView('announcements')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <Bullhorn size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Global Announcements</h3>
                  <p className="text-gray-600 text-sm">Post important announcements to all portals.</p>
                </div>

                <div 
                  onClick={() => setActiveView('settings')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <Settings size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">System Settings</h3>
                  <p className="text-gray-600 text-sm">Configure portal options and security.</p>
                </div>
              </div>
            </div>
          )}

          {/* MANAGE USERS VIEW */}
          {activeView === 'users' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <Users className="mr-3" size={28} /> Manage Users
              </h2>
              <p className="text-gray-700 mb-6">Edit student balances and status below. Changes will save directly to your Google Sheet.</p>
              
              {isLoadingUsers ? (
                <p className="text-gray-500 italic flex items-center"><Loader2 className="animate-spin mr-2" size={16}/> Loading users securely from database...</p>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#008751] text-white">
                        <th className="p-3 font-medium">Student ID</th>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">Contact #</th>
                        <th className="p-3 font-medium">Role</th>
                        <th className="p-3 font-medium">Balance (₱)</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.student_id} id={`row-${user.student_id}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-bold">{user.student_id}</td>
                          <td className="p-3">{user.name || <i className="text-gray-400">Not set</i>}</td>
                          <td className="p-3">{user.contact || <i className="text-gray-400">No record</i>}</td>
                          <td className="p-3 capitalize">{user.role}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              className="balance-input border border-gray-300 rounded px-2 py-1.5 w-24 outline-none focus:border-[#008751]"
                              defaultValue={user.balance || 0}
                            />
                          </td>
                          <td className="p-3">
                            <select 
                              className="status-select border border-gray-300 rounded px-2 py-1.5 w-28 outline-none focus:border-[#008751]"
                              defaultValue={user.status_val || 'Pending'}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Unpaid">Unpaid</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <button 
                              className="save-btn bg-[#008751] hover:bg-[#00683f] text-white font-medium py-1.5 px-4 rounded transition-colors"
                              onClick={() => handleUpdateUser(user.student_id, user.balance, user.status_val)}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-gray-500">No students found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS VIEW */}
          {activeView === 'announcements' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <Bullhorn className="mr-3" size={28} /> Post Announcement
              </h2>
              <p className="text-gray-700 mb-6">Write an announcement below. It will instantly appear on the Student Portal feed.</p>
              
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
                  className="bg-[#10af33] hover:bg-[#0c9c2c] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center disabled:opacity-70"
                >
                  {isPosting ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                  {isPosting ? 'Posting...' : 'Post to Feed'}
                </button>
                
                {postStatus && (
                  <p className={`mt-4 font-medium ${postStatus.includes('Error') ? 'text-red-500' : 'text-[#008751]'}`}>
                    {postStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeView === 'settings' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <Settings className="mr-3" size={28} /> System Settings
              </h2>
              <p className="text-gray-700 mb-6">Configure global portal options.</p>
              
              <div className="bg-white p-8 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] max-w-2xl">
                
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <strong className="text-gray-800">Maintenance Mode</strong>
                    <p className="text-sm text-gray-500 mt-1">Temporarily disable logins for all users except Admins.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <strong className="text-gray-800">Allow Student Registration</strong>
                    <p className="text-sm text-gray-500 mt-1">Allow new students to create an account from the login page.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-4">
                  <div>
                    <strong className="text-gray-800">Email Notifications</strong>
                    <p className="text-sm text-gray-500 mt-1">Send automated emails when balances are updated.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                  </label>
                </div>

              </div>
              <p className="mt-4 text-gray-500 text-sm italic">Note: Settings are currently in preview mode.</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
