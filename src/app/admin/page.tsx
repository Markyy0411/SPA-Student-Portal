"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import useSWR, { mutate } from 'swr';
import { LogOut, Users, Settings, ShieldCheck, Megaphone, ArrowLeft, Moon, Sun, ReceiptText, UserCircle } from 'lucide-react';
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

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // App State
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState('');
  
  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [allowProfileEdits, setAllowProfileEdits] = useState(false);

  // SWR Hooks
  const { data: usersData, error: usersError, isLoading: isLoadingUsers } = useSWR(
    (currentUser && activeView === 'users') ? [GOOGLE_SCRIPT_URL, 'fetch_data', currentUser.role, currentUser.student_id] : null,
    ([url, action, role, id]) => fetcher(url, action, role, id),
    { revalidateOnFocus: false }
  );

  const { data: announcementsData } = useSWR(
    (currentUser && activeView === 'announcements') ? [GOOGLE_SCRIPT_URL, 'fetch_announcements', currentUser.role] : null,
    ([url, action, role]) => fetcher(url, action, role),
    { revalidateOnFocus: false }
  );
  const announcements = announcementsData || [];

  const users = usersData ? usersData.filter((u: any) => u.student_id && u.role !== 'admin' && u.role !== 'staff') : [];

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

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setActiveView(event.state.view);
      } else {
        setActiveView('dashboard');
      }
    };
    
    // Initialize initial state if not present
    window.history.replaceState({ view: 'dashboard' }, '', '');
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (view: string) => {
    window.history.pushState({ view }, '', `#${view}`);
    setActiveView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const viewProfile = (user: any) => {
    Swal.fire({
      title: 'Student Profile',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Name:</strong> ${user.name || 'Not Set'}</p>
          <p><strong>Student ID:</strong> ${user.student_id}</p>
          <p><strong>LRN:</strong> ${user.lrn || 'Not Set'}</p>
          <p><strong>Date of Birth:</strong> ${user.dob ? new Date(user.dob).toLocaleDateString() : 'Not Set'}</p>
          <p><strong>Age:</strong> ${user.age || 'Not Set'}</p>
          <p><strong>Sex:</strong> ${user.sex || 'Not Set'}</p>
          <p><strong>Contact Number:</strong> ${user.contact || 'Not Set'}</p>
          <hr style="margin: 10px 0; border-color: #ddd;">
          <p><strong>Balance:</strong> ₱${user.balance || 0}</p>
          <p><strong>Status:</strong> ${user.status_val || 'Pending'}</p>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#1d4ed8'
    });
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

    const newBalance = Number(currentBalance) - Number(amount); // Subtract payment from balance

    const tr = document.getElementById(`row-${targetId}`);
    const statusSelect = tr?.querySelector('.status-select') as HTMLSelectElement;
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
        // Optimistic UI update
        mutate([GOOGLE_SCRIPT_URL, 'fetch_data', currentUser.role, currentUser.student_id]);
        Swal.fire('Success', 'Transaction logged & balance updated.', 'success');
        
        // Trigger Email Notification API asynchronously
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
          author: currentUser.name || "Administrator",
          message: announcementMsg.trim()
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setAnnouncementMsg('');
        setPostStatus('Announcement posted successfully!');
        
        // Send email blast
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'announcement',
            author: currentUser.name || "Administrator",
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300 text-gray-900 dark:text-gray-100">
      
      {/* Navbar */}
      <nav className="bg-[#1d4ed8] dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50 border-b border-transparent dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-blue-200" />
              <span className="font-bold text-xl tracking-tight">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-blue-700 dark:bg-gray-800 rounded-lg hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <span className="text-sm font-medium hidden sm:block">Welcome, {currentUser.name || 'Administrator'}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-700 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-inner"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div onClick={() => changeView('users')} className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-blue-50 dark:bg-blue-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Users size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">User Management</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">View students, log transactions, and edit status.</p>
              <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:text-blue-800 transition-colors">Manage Users &rarr;</button>
            </div>

            <div onClick={() => changeView('announcements')} className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-green-50 dark:bg-green-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <Megaphone size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">Global Announcements</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Post important announcements and updates.</p>
              <button className="text-green-600 dark:text-green-400 font-semibold text-sm group-hover:text-green-800 transition-colors">Post Announcement &rarr;</button>
            </div>

            <div onClick={() => changeView('settings')} className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="bg-gray-100 dark:bg-gray-800 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-gray-600 dark:text-gray-300">
                <Settings size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">System Settings</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Configure global portal settings and maintenance.</p>
              <button className="text-gray-600 dark:text-gray-400 font-semibold text-sm group-hover:text-gray-200 transition-colors">View Settings &rarr;</button>
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {activeView === 'users' && (
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in">
            <button 
              onClick={() => changeView('dashboard')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Users className="mr-3 text-blue-600 dark:text-blue-400" size={28} /> Manage Users & Transactions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Log payments or fees. This will update the balance and record the transaction.</p>
            
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                      <th className="p-3 font-semibold border-b dark:border-gray-800">Student ID</th>
                      <th className="p-3 font-semibold border-b dark:border-gray-800">Name</th>
                      <th className="p-3 font-semibold border-b dark:border-gray-800">Balance (₱)</th>
                      <th className="p-3 font-semibold border-b dark:border-gray-800">Status</th>
                      <th className="p-3 font-semibold border-b dark:border-gray-800 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.student_id} id={`row-${user.student_id}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-3 font-medium">{user.student_id}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400 font-medium">{user.name || <i className="opacity-50">Not set</i>}</td>
                        <td className="p-3 font-bold text-gray-800 dark:text-gray-200">
                          ₱{user.balance || 0}
                        </td>
                        <td className="p-3">
                          <select 
                            className="status-select bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 w-28 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                            defaultValue={user.status_val || 'Pending'}
                          >
                            <option className="text-black" value="Pending">Pending</option>
                            <option className="text-black" value="Paid">Paid</option>
                            <option className="text-black" value="Unpaid">Unpaid</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2 justify-center">
                            <button 
                              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-1.5 px-3 rounded flex items-center transition-colors text-sm"
                              onClick={() => viewProfile(user)}
                            >
                              <UserCircle size={16} className="mr-1" /> Profile
                            </button>
                            <button 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded flex items-center transition-colors text-sm"
                              onClick={() => handleUpdateBalance(user.student_id, user.balance, user.status_val)}
                            >
                              <ReceiptText size={16} className="mr-1" /> Log Tx
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 dark:text-gray-400">
                          No users found. Make sure students have valid Student IDs.
                        </td>
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
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <button 
                onClick={() => changeView('dashboard')}
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

            {/* Past Announcements Feed */}
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-6 border border-gray-100 dark:border-gray-800 h-full overflow-y-auto max-h-[600px]">
              <h3 className="text-lg font-bold mb-4 flex items-center">Recent Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-sm">No announcements posted yet.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.slice().reverse().map((ann: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{ann.author}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{new Date(ann.date).toLocaleString()}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeView === 'settings' && (
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in max-w-3xl">
            <button 
              onClick={() => changeView('dashboard')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium mb-6 flex items-center transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Settings className="mr-3 text-gray-600 dark:text-gray-300" size={28} /> System Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Manage global configurations for the Student Portal.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lock the portal temporarily. Students will not be able to log in.</p>
                </div>
                <button 
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically send emails when new announcements or transactions are logged.</p>
                </div>
                <button 
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${emailNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Allow Profile Edits</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Permit students to update their own contact information from their dashboard.</p>
                </div>
                <button 
                  onClick={() => setAllowProfileEdits(!allowProfileEdits)}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${allowProfileEdits ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${allowProfileEdits ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => Swal.fire('Saved!', 'System settings have been updated successfully.', 'success')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
