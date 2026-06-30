"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, GraduationCap, IdCard, CalendarDays, Bell, FileText, Download } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

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
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'fetch_announcements' })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setAnnouncements(result.data.reverse()); // Newest first
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
      confirmButtonColor: '#16a34a'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-green-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-medium">Loading portal...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm p-4 sm:p-8">
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center">
              <GraduationCap className="mr-3" size={32} />
              Student Dashboard
            </h1>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <LogOut size={18} className="mr-2 hidden sm:block" />
              Logout
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in-up">
              <p className="text-gray-600 mb-8 text-lg">
                Welcome back, <span className="font-semibold text-gray-900">{currentUser.name || 'Student'}</span>! Check your progress and latest updates here.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600 cursor-pointer hover:-translate-y-1 transition-transform group text-center"
                >
                  <IdCard size={40} className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800 mb-2">My Profile & Balance</h3>
                  <p className="text-sm text-gray-500">View your personal info and outstanding balance.</p>
                </div>
                
                <div 
                  onClick={() => setActiveTab('schedule')}
                  className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600 cursor-pointer hover:-translate-y-1 transition-transform group text-center"
                >
                  <CalendarDays size={40} className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800 mb-2">Class Schedule</h3>
                  <p className="text-sm text-gray-500">View your weekly class schedule and rooms.</p>
                </div>
                
                <div 
                  onClick={loadAnnouncements}
                  className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600 cursor-pointer hover:-translate-y-1 transition-transform group text-center"
                >
                  <Bell size={40} className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800 mb-2">Announcements</h3>
                  <p className="text-sm text-gray-500">Read the latest news and updates.</p>
                </div>
                
                <div 
                  onClick={() => setActiveTab('documents')}
                  className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600 cursor-pointer hover:-translate-y-1 transition-transform group text-center"
                >
                  <FileText size={40} className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800 mb-2">Documents</h3>
                  <p className="text-sm text-gray-500">Download handbook and waivers.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-fade-in-up">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-500 hover:text-gray-800 mb-6 font-medium inline-flex items-center transition-colors"
              >
                &larr; Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <IdCard className="mr-3 text-green-600" /> My Profile & Balance
              </h2>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl border-l-4 border-l-green-600 p-6 divide-y divide-gray-100">
                <div className="flex justify-between py-4">
                  <span className="text-gray-500 font-medium">Student Name:</span>
                  <span className="font-bold text-gray-900">{currentUser.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-gray-500 font-medium">LRN:</span>
                  <span className="font-semibold text-gray-900">{currentUser.lrn || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-gray-500 font-medium">Student ID:</span>
                  <span className="font-semibold text-gray-900">{currentUser.student_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-gray-500 font-medium">Date of Birth:</span>
                  <span className="font-semibold text-gray-900">
                    {currentUser.dob ? (
                      isNaN(new Date(currentUser.dob).getTime()) ? currentUser.dob : new Date(currentUser.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-gray-500 font-medium">Current Balance:</span>
                  <span className="font-bold text-green-600 text-xl">₱{currentUser.balance || '0'}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-gray-500 font-medium">Enrollment Status:</span>
                  <span className={`font-bold uppercase ${currentUser.status_val === 'Paid' ? 'text-green-600' : currentUser.status_val === 'Unpaid' ? 'text-red-500' : 'text-yellow-600'}`}>
                    {currentUser.status_val || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="animate-fade-in-up">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-500 hover:text-gray-800 mb-6 font-medium inline-flex items-center transition-colors"
              >
                &larr; Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CalendarDays className="mr-3 text-green-600" /> Weekly Schedule
              </h2>

              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full text-center">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="p-4 font-semibold border-b border-green-700">Time</th>
                      <th className="p-4 font-semibold border-b border-green-700">Monday</th>
                      <th className="p-4 font-semibold border-b border-green-700">Tuesday</th>
                      <th className="p-4 font-semibold border-b border-green-700">Wednesday</th>
                      <th className="p-4 font-semibold border-b border-green-700">Thursday</th>
                      <th className="p-4 font-semibold border-b border-green-700">Friday</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 font-semibold text-gray-500 bg-gray-50">08:00 AM - 09:30 AM</td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Mathematics<br/><span className="font-normal text-sm">Room 101</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Science<br/><span className="font-normal text-sm">Lab A</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Mathematics<br/><span className="font-normal text-sm">Room 101</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Science<br/><span className="font-normal text-sm">Lab A</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Physical Ed.<br/><span className="font-normal text-sm">Gym</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-gray-500 bg-gray-50">09:30 AM - 11:00 AM</td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">English<br/><span className="font-normal text-sm">Room 102</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">History<br/><span className="font-normal text-sm">Room 205</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">English<br/><span className="font-normal text-sm">Room 102</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">History<br/><span className="font-normal text-sm">Room 205</span></td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Computer<br/><span className="font-normal text-sm">Lab B</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-gray-500 bg-gray-50">11:00 AM - 12:00 PM</td>
                      <td colSpan={5} className="p-4 bg-orange-50 text-orange-600 font-bold uppercase tracking-wider">LUNCH BREAK</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-gray-500 bg-gray-50">12:00 PM - 01:30 PM</td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Values Ed.<br/><span className="font-normal text-sm">Room 105</span></td>
                      <td className="p-4 text-gray-400">-</td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Values Ed.<br/><span className="font-normal text-sm">Room 105</span></td>
                      <td className="p-4 text-gray-400">-</td>
                      <td className="p-4 bg-green-50 text-green-800 font-bold rounded-lg m-1">Arts & Music<br/><span className="font-normal text-sm">Room 106</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="animate-fade-in-up">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-500 hover:text-gray-800 mb-6 font-medium inline-flex items-center transition-colors"
              >
                &larr; Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Bell className="mr-3 text-green-600" /> Latest Announcements
              </h2>

              {loadingAnnouncements ? (
                <p className="text-gray-500 animate-pulse">Checking for new announcements...</p>
              ) : announcements.length === 0 ? (
                <p className="text-gray-500">No announcements at this time.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                      <div className="text-sm text-gray-500 mb-3 font-medium">
                        Posted by <span className="font-bold text-gray-800">{ann.author || 'Admin'}</span> • {new Date(ann.date).toLocaleDateString()}
                      </div>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{ann.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="animate-fade-in-up">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-500 hover:text-gray-800 mb-6 font-medium inline-flex items-center transition-colors"
              >
                &larr; Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="mr-3 text-green-600" /> Download Documents
              </h2>

              <div className="space-y-4">
                {[
                  { title: 'Student Handbook 2025-2026', size: '2.4 MB' },
                  { title: 'Medical Waiver & Consent Form', size: '150 KB' },
                  { title: 'Student Clearance Form', size: '85 KB' },
                ].map((doc, i) => (
                  <div 
                    key={i}
                    onClick={() => handleDownload(doc.title)}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                  >
                    <div className="flex items-center">
                      <FileText className="text-red-500 mr-4" size={32} />
                      <div>
                        <h4 className="font-bold text-gray-800">{doc.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">PDF Document • {doc.size}</p>
                      </div>
                    </div>
                    <Download className="text-gray-400" />
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
