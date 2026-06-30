import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Database, DatabaseBackup, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

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
          
          <h1 className="text-[#008751] text-3xl font-bold mb-2.5 flex items-center gap-3">
            <ShieldCheck size={32} /> Admin Dashboard
          </h1>
          <p className="text-gray-800 text-[16px] mb-8">
            Welcome, <span className="font-semibold">{currentUser.name || 'Administrator'}</span>. You have full system access.
          </p>
          
          <div className="flex flex-wrap gap-5 mt-[30px]">
            {/* Card 1 */}
            <div className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <Users size={35} className="text-[#008751] mx-auto mb-4" />
              <h3 className="text-[19px] font-semibold mb-2">User Management</h3>
              <p className="text-[14px] text-gray-600">View, edit, or remove student and staff accounts. Reset passwords.</p>
            </div>

            {/* Card 2 */}
            <div className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <Database size={35} className="text-[#008751] mx-auto mb-4" />
              <h3 className="text-[19px] font-semibold mb-2">Database Setup</h3>
              <p className="text-[14px] text-gray-600">Configure Supabase connection strings, manage tables and schemas.</p>
            </div>

            {/* Card 3 */}
            <div className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <DatabaseBackup size={35} className="text-[#008751] mx-auto mb-4" />
              <h3 className="text-[19px] font-semibold mb-2">Migration Tools</h3>
              <p className="text-[14px] text-gray-600">Sync data from legacy Google Sheets into the new SQL database.</p>
            </div>

            {/* Card 4 */}
            <div className="flex-[1_1_250px] bg-white p-[25px] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center border-t-4 border-[#008751] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <Settings size={35} className="text-[#008751] mx-auto mb-4" />
              <h3 className="text-[19px] font-semibold mb-2">System Settings</h3>
              <p className="text-[14px] text-gray-600">Configure global portal options, maintenance mode, and logs.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
