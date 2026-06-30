"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Users, Settings, ShieldCheck, Megaphone, ArrowLeft, Loader2 } from 'lucide-react';
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
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'fetch_data',
          role: currentUser.role,
          student_id: currentUser.student_id
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
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
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-medium">Loading portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar (The Blue Header) */}
      <nav className="bg-[#1d4ed8] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-blue-200" />
              <span className="font-bold text-xl tracking-tight">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium hidden sm:block">Welcome, {currentUser.name || 'Administrator'}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-inner"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            
            <div onClick={() => { setActiveView('users'); loadUsers(); }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <Users size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">User Management</h2>
              <p className="text-gray-500 text-sm mb-4">View, edit, or remove student and staff accounts. Reset passwords.</p>
              <button className="text-blue-600 font-semibold text-sm group-hover:text-blue-800 transition-colors">Manage Users &rarr;</button>
            </div>

            <div onClick={() => setActiveView('announcements')} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-green-600">
                <Megaphone size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Global Announcements</h2>
              <p className="text-gray-500 text-sm mb-4">Post important announcements and updates to all student and staff portals.</p>
              <button className="text-green-600 font-semibold text-sm group-hover:text-green-800 transition-colors">Post Announcement &rarr;</button>
            </div>

            <div onClick={() => setActiveView('settings')} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-gray-600">
                <Settings size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">System Settings</h2>
              <p className="text-gray-500 text-sm mb-4">Configure global portal settings, maintenance mode, and logs.</p>
              <button className="text-gray-600 font-semibold text-sm group-hover:text-gray-800 transition-colors">View Settings &rarr;</button>
            </div>

          </div>
        )}

        {/* MANAGE USERS VIEW */}
        {activeView === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Users className="mr-3 text-blue-600" size={28} /> Manage Users
            </h2>
            <p className="text-gray-600 mb-6">Edit student balances and status below. Changes will save directly to your Google Sheet.</p>
            
            {isLoadingUsers ? (
              <p className="text-blue-600 italic flex items-center"><Loader2 className="animate-spin mr-2" size={16}/> Loading users securely from database...</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="p-3 font-semibold border-b">Student ID</th>
                      <th className="p-3 font-semibold border-b">Name</th>
                      <th className="p-3 font-semibold border-b">Contact #</th>
                      <th className="p-3 font-semibold border-b">Role</th>
                      <th className="p-3 font-semibold border-b">Balance (₱)</th>
                      <th className="p-3 font-semibold border-b">Status</th>
                      <th className="p-3 font-semibold border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.student_id} id={`row-${user.student_id}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{user.student_id}</td>
                        <td className="p-3 text-gray-600">{user.name || <i className="text-gray-400">Not set</i>}</td>
                        <td className="p-3 text-gray-600">{user.contact || <i className="text-gray-400">No record</i>}</td>
                        <td className="p-3 capitalize text-gray-600">{user.role}</td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="balance-input border border-gray-300 rounded px-2 py-1.5 w-24 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            defaultValue={user.balance || 0}
                          />
                        </td>
                        <td className="p-3">
                          <select 
                            className="status-select border border-gray-300 rounded px-2 py-1.5 w-28 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            defaultValue={user.status_val || 'Pending'}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <button 
                            className="save-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded transition-colors"
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in max-w-3xl">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Megaphone className="mr-3 text-green-600" size={28} /> Post Announcement
            </h2>
            <p className="text-gray-600 mb-6">Write an announcement below. It will instantly appear on the Student Portal feed.</p>
            
            <div className="space-y-4">
              <label className="block font-semibold text-gray-800 mb-1">Announcement Message:</label>
              <textarea 
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-y"
              ></textarea>
              
              <button 
                onClick={handlePostAnnouncement}
                disabled={isPosting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center disabled:opacity-70 w-full sm:w-auto justify-center"
              >
                {isPosting ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                {isPosting ? 'Posting...' : 'Post to Feed'}
              </button>
              
              {postStatus && (
                <p className={`mt-2 font-medium ${postStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {postStatus}
                </p>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeView === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in max-w-3xl">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Settings className="mr-3 text-gray-600" size={28} /> System Settings
            </h2>
            <p className="text-gray-600 mb-6">Configure global portal options.</p>
            
            <div className="space-y-6">
              
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="pr-4">
                  <strong className="text-gray-800 block">Maintenance Mode</strong>
                  <p className="text-sm text-gray-500 mt-1">Temporarily disable logins for all users except Admins.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="pr-4">
                  <strong className="text-gray-800 block">Allow Student Registration</strong>
                  <p className="text-sm text-gray-500 mt-1">Allow new students to create an account from the login page.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center py-4">
                <div className="pr-4">
                  <strong className="text-gray-800 block">Email Notifications</strong>
                  <p className="text-sm text-gray-500 mt-1">Send automated emails when balances are updated.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

            </div>
            <p className="mt-8 text-gray-400 text-sm italic">Note: Settings are currently in preview mode.</p>
          </div>
        )}
        
      </main>
    </div>
  );
}
