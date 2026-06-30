import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, Users, Bullhorn, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function StaffDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Form states
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [postStatus, setPostStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

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

  const loadStudents = async () => {
    setActiveTab('classes');
    if (students.length > 0) return;

    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student');

      if (data && !error) {
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const postAnnouncement = async () => {
    if (!announcementMsg.trim()) {
      alert("Please enter a message.");
      return;
    }

    setPostingAnnouncement(true);
    setPostStatus(null);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          author: currentUser.name || "Staff Member",
          message: announcementMsg,
          date: new Date().toISOString()
        }]);

      if (!error) {
        setAnnouncementMsg('');
        setPostStatus({ type: 'success', msg: 'Announcement posted successfully!' });
      } else {
        setPostStatus({ type: 'error', msg: `Error: ${error.message}` });
      }
    } catch (e: any) {
      setPostStatus({ type: 'error', msg: 'Network error while posting.' });
    } finally {
      setPostingAnnouncement(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 bg-[url('/bghome.jpg')] bg-cover bg-center bg-no-repeat -z-10"
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
                <Users size={32} /> Staff Dashboard
              </h1>
              <p className="text-gray-800 text-[16px] mb-8">
                Welcome, <span className="font-semibold">{currentUser.name || 'Staff Member'}</span>.
              </p>
              
              <div className="flex flex-wrap gap-5 mt-[30px]">
                <div 
                  onClick={loadStudents}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <Users size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">Manage Classes</h3>
                  <p className="text-[14px] text-gray-600">View enrolled students and class rosters.</p>
                </div>
                
                <div 
                  onClick={() => setActiveTab('announcements')}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <Bullhorn size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">Post Announcement</h3>
                  <p className="text-[14px] text-gray-600">Send an announcement to the Student feed.</p>
                </div>
                
                <div 
                  onClick={() => setActiveTab('messages')}
                  className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <Mail size={35} className="text-[#008751] mx-auto mb-4" />
                  <h3 className="text-[19px] font-semibold mb-2">Messages</h3>
                  <p className="text-[14px] text-gray-600">Communicate with students and parents.</p>
                </div>
              </div>
            </div>
          )}

          {/* Classes View */}
          {activeTab === 'classes' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#555] hover:bg-[#333] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors flex items-center gap-2 mb-5"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <h2 className="text-[#008751] text-2xl font-bold mb-2 flex items-center gap-3">
                <Users size={26} /> Student Roster
              </h2>
              <p className="text-gray-800 mb-5">View all enrolled students. Editing capabilities are restricted to Admins.</p>
              
              {loadingStudents ? (
                <p className="italic text-[#666]">Loading student list...</p>
              ) : (
                <div className="overflow-x-auto mt-5">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-left">
                    <thead>
                      <tr>
                        <th className="bg-[#008751] text-white font-medium p-[12px_15px] border-b border-[#eee]">Student ID</th>
                        <th className="bg-[#008751] text-white font-medium p-[12px_15px] border-b border-[#eee]">Name</th>
                        <th className="bg-[#008751] text-white font-medium p-[12px_15px] border-b border-[#eee]">Status</th>
                        <th className="bg-[#008751] text-white font-medium p-[12px_15px] border-b border-[#eee]">Contact #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, i) => (
                        <tr key={i} className="hover:bg-[#f9f9f9]">
                          <td className="p-[12px_15px] border-b border-[#eee]"><strong>{student.student_id}</strong></td>
                          <td className="p-[12px_15px] border-b border-[#eee]">{student.name || <i className="text-gray-400">Not set</i>}</td>
                          <td className="p-[12px_15px] border-b border-[#eee]">
                            <span style={{ color: student.status_val === 'Paid' ? '#008751' : student.status_val === 'Unpaid' ? '#ff4d4d' : '#e6a23c' }}>
                              {student.status_val || 'Pending'}
                            </span>
                          </td>
                          <td className="p-[12px_15px] border-b border-[#eee]">{student.contact || <i className="text-gray-400">N/A</i>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <Bullhorn size={26} /> Post Announcement
              </h2>
              <p className="text-gray-800 mb-5">Write an announcement below. It will instantly appear on the Student Portal feed.</p>
              
              <div className="mb-5 max-w-[600px]">
                <label className="block mb-2 font-semibold text-[#333]">Announcement Message:</label>
                <textarea 
                  className="w-full h-[150px] p-[15px] border border-[#ccc] rounded-lg font-sans text-[15px] resize-y"
                  placeholder="Type your message here..."
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                ></textarea>
              </div>
              
              <button 
                onClick={postAnnouncement}
                disabled={postingAnnouncement}
                className="bg-[#10af33] hover:bg-[#0c9c2c] text-white border-none py-[12px] px-[25px] rounded-lg font-semibold text-[16px] cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {postingAnnouncement ? (
                  <>Posting...</>
                ) : (
                  <><Send size={18} /> Post to Feed</>
                )}
              </button>
              
              {postStatus && (
                <p className={`mt-[10px] font-medium flex items-center gap-2 ${postStatus.type === 'success' ? 'text-[#008751]' : 'text-[#ff4d4d]'}`}>
                  {postStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {postStatus.msg}
                </p>
              )}
            </div>
          )}

          {/* Messages View */}
          {activeTab === 'messages' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#555] hover:bg-[#333] text-white border-none py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-colors flex items-center gap-2 mb-5"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <h2 className="text-[#008751] text-2xl font-bold mb-2 flex items-center gap-3">
                <Mail size={26} /> Inbox
              </h2>
              <p className="text-gray-800 mb-5">Recent messages from students and parents.</p>
              
              <div className="flex flex-col gap-[10px] mt-5">
                <div className="bg-white p-[15px_20px] rounded-lg border-l-[4px] border-[#008751] shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex justify-between items-center cursor-pointer hover:bg-[#f9f9f9]">
                  <div>
                    <div className="font-semibold text-[#333]">Domingo Family</div>
                    <div className="text-[#666] text-[14px] mt-1">Question regarding the upcoming science project deadline...</div>
                  </div>
                  <div className="text-[#999] text-[12px]">10:30 AM</div>
                </div>
                
                <div className="bg-white p-[15px_20px] rounded-lg border-l-[4px] border-[#008751] shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex justify-between items-center cursor-pointer hover:bg-[#f9f9f9]">
                  <div>
                    <div className="font-semibold text-[#333]">Student: John Doe</div>
                    <div className="text-[#666] text-[14px] mt-1">I was absent yesterday, could you send the notes?</div>
                  </div>
                  <div className="text-[#999] text-[12px]">Yesterday</div>
                </div>
                
                <div className="bg-white p-[15px_20px] rounded-lg border-l-[4px] border-[#008751] shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex justify-between items-center cursor-pointer hover:bg-[#f9f9f9] opacity-60">
                  <div>
                    <div className="font-semibold text-[#333]">System Admin</div>
                    <div className="text-[#666] text-[14px] mt-1">Reminder: Final grades are due next Friday.</div>
                  </div>
                  <div className="text-[#999] text-[12px]">Monday</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
