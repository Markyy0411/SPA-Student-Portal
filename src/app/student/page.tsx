import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, GraduationCap, IdCard, CalendarDays, Bell, FileText, Download, ArrowLeft, UserCircle, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '@/utils/supabase';

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

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
    setActiveTab('announcements');
    if (announcements.length > 0) return; // already loaded

    setLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (data && !error) {
        setAnnouncements(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleDownload = (filename: string) => {
    Swal.fire({
      title: 'Download Started!',
      text: `In a fully built system, ${filename} would download now.`,
      icon: 'info',
      confirmButtonColor: '#008751'
    });
  };

  if (!currentUser) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat -z-10"
      ></div>

      <div className="max-w-[1000px] mx-auto mt-20 mb-20 px-5">
        <div className="bg-white/90 backdrop-blur-[15px] rounded-[20px] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] min-h-[500px]">
          
          <button 
            onClick={handleLogout}
            className="float-right bg-[#ff4d4d] hover:bg-[#e60000] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors"
          >
            Logout
          </button>
          
          {/* Main Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-[#008751] text-3xl font-bold mb-2.5 flex items-center gap-3">
                <GraduationCap size={32} /> Student Dashboard
              </h1>
              <p className="text-gray-800 text-[16px] mb-8">
                Welcome back, <span className="font-semibold">{currentUser.name || 'Student'}</span>! Check your progress and latest updates here.
              </p>
              
              <div className="flex flex-wrap gap-5 mt-[30px]">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <IdCard size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">My Profile & Balance</h3>
                  <p className="text-[14px] text-gray-600">View your personal information and current outstanding balance.</p>
                </div>
                
                <div 
                  onClick={() => setActiveTab('schedule')}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <CalendarDays size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">Class Schedule</h3>
                  <p className="text-[14px] text-gray-600">View your weekly class schedule and room assignments.</p>
                </div>
                
                <div 
                  onClick={loadAnnouncements}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <Bell size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">Announcements</h3>
                  <p className="text-[14px] text-gray-600">Read the latest news and updates from the school.</p>
                </div>
                
                <div 
                  onClick={() => setActiveTab('documents')}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <FileText size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">Download Documents</h3>
                  <p className="text-[14px] text-gray-600">Access enrollment forms, student handbook, and waivers.</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#555] hover:bg-[#333] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors flex items-center gap-2 mb-5"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <h2 className="text-[#008751] text-2xl font-bold mb-5 flex items-center gap-3">
                <User size={26} /> My Profile & Balance
              </h2>
              
              <div className="bg-white p-[30px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] max-w-[600px] mt-5 border-l-[5px] border-[#008751]">
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">Student Name:</span>
                  <span className="font-semibold text-[#333] text-right">{currentUser.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">LRN:</span>
                  <span className="font-semibold text-[#333] text-right">{currentUser.lrn || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">Student ID:</span>
                  <span className="font-semibold text-[#333] text-right">{currentUser.student_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">Date of Birth:</span>
                  <span className="font-semibold text-[#333] text-right">{formatDate(currentUser.dob)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">Age / Sex:</span>
                  <span className="font-semibold text-[#333] text-right">{currentUser.age || '0'} / {currentUser.sex || '-'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">Guardian Contact:</span>
                  <span className="font-semibold text-[#333] text-right">{currentUser.contact || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#eee] text-[16px]">
                  <span className="text-[#666] font-medium">Current Balance:</span>
                  <span className="font-bold text-[#008751] text-[22px] text-right">₱{currentUser.balance || '0'}</span>
                </div>
                <div className="flex justify-between py-3 text-[16px]">
                  <span className="text-[#666] font-medium">Enrollment Status:</span>
                  <span 
                    className="font-semibold text-right capitalize"
                    style={{ color: currentUser.status_val === 'Paid' ? '#008751' : currentUser.status_val === 'Unpaid' ? '#ff4d4d' : '#e6a23c' }}
                  >
                    {currentUser.status_val || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Schedule View */}
          {activeTab === 'schedule' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#555] hover:bg-[#333] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors flex items-center gap-2 mb-5"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <h2 className="text-[#008751] text-2xl font-bold mb-2 flex items-center gap-3">
                <CalendarDays size={26} /> Weekly Schedule
              </h2>
              <p className="text-gray-800 mb-5">Your current class schedule for the semester.</p>
              
              <div className="overflow-x-auto mt-5">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.05)] text-center">
                  <thead>
                    <tr>
                      <th className="bg-[#008751] text-white font-semibold p-[15px] border-r border-[#eee]">Time</th>
                      <th className="bg-[#008751] text-white font-semibold p-[15px] border-r border-[#eee]">Monday</th>
                      <th className="bg-[#008751] text-white font-semibold p-[15px] border-r border-[#eee]">Tuesday</th>
                      <th className="bg-[#008751] text-white font-semibold p-[15px] border-r border-[#eee]">Wednesday</th>
                      <th className="bg-[#008751] text-white font-semibold p-[15px] border-r border-[#eee]">Thursday</th>
                      <th className="bg-[#008751] text-white font-semibold p-[15px]">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold bg-[#f9f9f9] text-[#555] p-[15px] border-b border-r border-[#eee]">08:00 AM - 09:30 AM</td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">Mathematics<br/><small className="font-normal">Room 101</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">Science<br/><small className="font-normal">Lab A</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">Mathematics<br/><small className="font-normal">Room 101</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">Science<br/><small className="font-normal">Lab A</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-[#eee]">Physical Ed.<br/><small className="font-normal">Gym</small></td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-[#f9f9f9] text-[#555] p-[15px] border-b border-r border-[#eee]">09:30 AM - 11:00 AM</td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">English<br/><small className="font-normal">Room 102</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">History<br/><small className="font-normal">Room 205</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">English<br/><small className="font-normal">Room 102</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-r border-[#eee]">History<br/><small className="font-normal">Room 205</small></td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-b border-[#eee]">Computer<br/><small className="font-normal">Lab B</small></td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-[#f9f9f9] text-[#555] p-[15px] border-b border-r border-[#eee]">11:00 AM - 12:00 PM</td>
                      <td colSpan={5} className="bg-[#fff3e0] text-[#e65100] font-semibold p-[15px] border-b border-[#eee]">LUNCH BREAK</td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-[#f9f9f9] text-[#555] p-[15px] border-r border-[#eee]">12:00 PM - 01:30 PM</td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-r border-[#eee]">Values Ed.<br/><small className="font-normal">Room 105</small></td>
                      <td className="p-[15px] border-r border-[#eee]">-</td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px] border-r border-[#eee]">Values Ed.<br/><small className="font-normal">Room 105</small></td>
                      <td className="p-[15px] border-r border-[#eee]">-</td>
                      <td className="bg-[#e8f5e9] text-[#1b5e20] font-semibold p-[15px]">Arts & Music<br/><small className="font-normal">Room 106</small></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Announcements View */}
          {activeTab === 'announcements' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#555] hover:bg-[#333] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors flex items-center gap-2 mb-5"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <h2 className="text-[#008751] text-2xl font-bold mb-2 flex items-center gap-3">
                <Bell size={26} /> Latest Announcements
              </h2>
              <p className="text-gray-800 mb-5">Stay up to date with the latest news from your teachers and administrators.</p>
              
              {loadingAnnouncements ? (
                <p className="italic text-[#666]">Checking for new announcements...</p>
              ) : (
                <div className="flex flex-col gap-[15px] mt-5">
                  {announcements.length === 0 ? (
                    <p>No announcements at this time.</p>
                  ) : (
                    announcements.map((ann, i) => {
                      let dateStr = ann.date;
                      try {
                        const d = new Date(ann.date);
                        if (!isNaN(d.getTime())) {
                          dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        }
                      } catch(e) {}
                      return (
                        <div key={i} className="bg-white p-5 rounded-xl border-l-[5px] border-[#10af33] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
                          <div className="text-[13px] text-[#777] mb-2.5 font-medium">
                            <UserCircle size={14} className="inline mr-1 -mt-0.5" /> Posted by <strong>{ann.author || 'Admin'}</strong> on {dateStr}
                          </div>
                          <div className="text-[16px] leading-[1.5] text-[#333] whitespace-pre-wrap">{ann.message}</div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Documents View */}
          {activeTab === 'documents' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#555] hover:bg-[#333] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors flex items-center gap-2 mb-5"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <h2 className="text-[#008751] text-2xl font-bold mb-2 flex items-center gap-3">
                <FileText size={26} /> Download Documents
              </h2>
              <p className="text-gray-800 mb-5">Click on any document below to download it directly to your device.</p>
              
              <div className="flex flex-col gap-[15px] mt-5">
                {[
                  { title: 'Student Handbook 2025-2026', size: '2.4 MB' },
                  { title: 'Medical Waiver & Consent Form', size: '150 KB' },
                  { title: 'Student Clearance Form', size: '85 KB' },
                ].map((doc, i) => (
                  <div 
                    key={i}
                    onClick={() => handleDownload(doc.title)}
                    className="bg-white p-5 rounded-xl border-l-[5px] border-[#e63946] shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center gap-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] no-underline block"
                  >
                    <FileText size={35} className="text-[#e63946]" />
                    <div className="flex-1">
                      <div className="text-[16px] text-[#333] font-semibold">{doc.title}</div>
                      <div className="text-[13px] text-[#777] font-medium mt-1">PDF Document &bull; {doc.size}</div>
                    </div>
                    <Download size={20} className="text-[#777] ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
