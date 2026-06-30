"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IdCard, CalendarDays, Bell, FileText, LogOut, ArrowLeft, Loader2, GraduationCap, Download, UserCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Data states
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  // Authentication check
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/');
    } else {
      const user = JSON.parse(userStr);
      if (user.role !== 'student') {
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

  const loadAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    setAnnouncements([]);

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'fetch_announcements' })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        // Reverse array to show newest first, filter out empty
        const validAnns = result.data.filter((a: any) => a.message).reverse();
        setAnnouncements(validAnns);
      } else {
        Swal.fire('Error', 'Could not load announcements.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Network error.', 'error');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  // Helper for DOB formatting
  const getFormattedDob = (dobStr: string) => {
    if (!dobStr) return 'N/A';
    try {
      const d = new Date(dobStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return dobStr;
    } catch {
      return dobStr;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden text-gray-800">
      <div className="fixed inset-0 bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed -z-10"></div>

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
                <GraduationCap className="mr-3" size={32} /> Student Dashboard
              </h1>
              <p className="text-gray-700">Welcome back, <span className="font-semibold">{currentUser.name || 'Student'}</span>! Check your progress and latest updates here.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mt-8">
                
                <div 
                  onClick={() => setActiveView('profile')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <IdCard size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">My Profile & Balance</h3>
                  <p className="text-gray-600 text-sm">View your personal information and current outstanding balance.</p>
                </div>

                <div 
                  onClick={() => setActiveView('schedule')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <CalendarDays size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Class Schedule</h3>
                  <p className="text-gray-600 text-sm">View your weekly class schedule and room assignments.</p>
                </div>

                <div 
                  onClick={() => { setActiveView('announcements'); loadAnnouncements(); }}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <Bell size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Announcements</h3>
                  <p className="text-gray-600 text-sm">Read the latest news and updates from the school.</p>
                </div>

                <div 
                  onClick={() => setActiveView('documents')}
                  className="bg-white p-6 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <FileText size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Download Documents</h3>
                  <p className="text-gray-600 text-sm">Access enrollment forms, student handbook, and waivers.</p>
                </div>

              </div>
            </div>
          )}

          {/* PROFILE VIEW */}
          {activeView === 'profile' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#008751] mb-6 flex items-center">
                <IdCard className="mr-3" size={28} /> My Profile & Balance
              </h2>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border-l-4 border-[#008751] max-w-2xl">
                <div className="space-y-4">
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Student Name:</span>
                    <span className="font-semibold text-right">{currentUser.name || "Not set"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">LRN:</span>
                    <span className="font-semibold text-right">{currentUser.lrn || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Student ID:</span>
                    <span className="font-semibold text-right">{currentUser.student_id || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Date of Birth:</span>
                    <span className="font-semibold text-right">{getFormattedDob(currentUser.dob)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Age / Sex:</span>
                    <span className="font-semibold text-right">{currentUser.age || "N/A"} / {currentUser.sex || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Guardian Contact:</span>
                    <span className="font-semibold text-right">{currentUser.contact || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Current Balance:</span>
                    <span className="font-bold text-[#008751] text-xl text-right">₱{currentUser.balance || "0"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">Enrollment Status:</span>
                    <span className={`font-semibold text-right capitalize ${
                      (currentUser.status_val || '').toLowerCase() === 'paid' ? 'text-[#008751]' :
                      (currentUser.status_val || '').toLowerCase() === 'unpaid' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {currentUser.status_val || "Pending"}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE VIEW */}
          {activeView === 'schedule' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <CalendarDays className="mr-3" size={28} /> Weekly Schedule
              </h2>
              <p className="text-gray-700 mb-6">Your current class schedule for the semester.</p>
              
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="w-full text-center border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#008751] text-white">
                      <th className="p-4 font-semibold border-b border-r border-[#007040]">Time</th>
                      <th className="p-4 font-semibold border-b border-r border-[#007040]">Monday</th>
                      <th className="p-4 font-semibold border-b border-r border-[#007040]">Tuesday</th>
                      <th className="p-4 font-semibold border-b border-r border-[#007040]">Wednesday</th>
                      <th className="p-4 font-semibold border-b border-r border-[#007040]">Thursday</th>
                      <th className="p-4 font-semibold border-b">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-600">08:00 AM - 09:30 AM</td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Mathematics<br/><small className="font-normal opacity-80">Room 101</small></td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Science<br/><small className="font-normal opacity-80">Lab A</small></td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Mathematics<br/><small className="font-normal opacity-80">Room 101</small></td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Science<br/><small className="font-normal opacity-80">Lab A</small></td>
                      <td className="p-4 border-b border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Physical Ed.<br/><small className="font-normal opacity-80">Gym</small></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-600">09:30 AM - 11:00 AM</td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">English<br/><small className="font-normal opacity-80">Room 102</small></td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">History<br/><small className="font-normal opacity-80">Room 205</small></td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">English<br/><small className="font-normal opacity-80">Room 102</small></td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">History<br/><small className="font-normal opacity-80">Room 205</small></td>
                      <td className="p-4 border-b border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Computer<br/><small className="font-normal opacity-80">Lab B</small></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-600">11:00 AM - 12:00 PM</td>
                      <td colSpan={5} className="p-4 border-b border-gray-100 bg-orange-50 text-orange-700 font-bold tracking-wider">LUNCH BREAK</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-600">12:00 PM - 01:30 PM</td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Values Ed.<br/><small className="font-normal opacity-80">Room 105</small></td>
                      <td className="p-4 border-b border-r border-gray-100">-</td>
                      <td className="p-4 border-b border-r border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Values Ed.<br/><small className="font-normal opacity-80">Room 105</small></td>
                      <td className="p-4 border-b border-r border-gray-100">-</td>
                      <td className="p-4 border-b border-gray-100 bg-green-50 text-green-900 font-semibold rounded-sm">Arts & Music<br/><small className="font-normal opacity-80">Room 106</small></td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                <Bell className="mr-3" size={28} /> Latest Announcements
              </h2>
              <p className="text-gray-700 mb-6">Stay up to date with the latest news from your teachers and administrators.</p>
              
              {isLoadingAnnouncements ? (
                <p className="text-gray-500 italic flex items-center"><Loader2 className="animate-spin mr-2" size={16}/> Checking for new announcements...</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {announcements.length === 0 && (
                    <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-100">No announcements at this time.</p>
                  )}
                  {announcements.map((ann, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border-l-4 border-[#10af33] shadow-sm">
                      <div className="flex items-center text-sm text-gray-500 font-medium mb-2">
                        <UserCircle size={16} className="mr-1.5" /> 
                        Posted by <strong className="text-gray-700 mx-1">{ann.author || 'Admin'}</strong> on {
                          new Date(ann.date).toLocaleDateString() !== 'Invalid Date' 
                            ? new Date(ann.date).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})
                            : ann.date
                        }
                      </div>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{ann.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS VIEW */}
          {activeView === 'documents' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg mb-6 flex items-center transition-colors text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#008751] mb-2 flex items-center">
                <FileText className="mr-3" size={28} /> Download Documents
              </h2>
              <p className="text-gray-700 mb-6">Click on any document below to download it directly to your device.</p>
              
              <div className="flex flex-col gap-4">
                
                <div 
                  onClick={() => Swal.fire('Download Started!', 'This is a presentation mockup. In a fully built system, the Student Handbook PDF would download now.', 'info')}
                  className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group"
                >
                  <FileText size={36} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg group-hover:text-red-600 transition-colors">Student Handbook 2025-2026</h4>
                    <p className="text-sm text-gray-500 mt-1">PDF Document &bull; 2.4 MB</p>
                  </div>
                  <Download size={24} className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>

                <div 
                  onClick={() => Swal.fire('Download Started!', 'This is a presentation mockup. In a fully built system, the Medical Waiver PDF would download now.', 'info')}
                  className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group"
                >
                  <FileText size={36} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg group-hover:text-red-600 transition-colors">Medical Waiver & Consent Form</h4>
                    <p className="text-sm text-gray-500 mt-1">PDF Document &bull; 150 KB</p>
                  </div>
                  <Download size={24} className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>

                <div 
                  onClick={() => Swal.fire('Download Started!', 'This is a presentation mockup. In a fully built system, the Clearance Form PDF would download now.', 'info')}
                  className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group"
                >
                  <FileText size={36} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg group-hover:text-red-600 transition-colors">Student Clearance Form</h4>
                    <p className="text-sm text-gray-500 mt-1">PDF Document &bull; 85 KB</p>
                  </div>
                  <Download size={24} className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
