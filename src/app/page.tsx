"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff, Info, ArrowLeft, X, CheckCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 1 && studentId.trim().length >= 4 && !isVerifying && !errorMsg) {
        handleVerifyId();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [studentId, step]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 2 && password.trim().length >= 4 && !isVerifying) {
        handleLogin();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [password, step]);

  const handleVerifyId = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying) return;
    
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'verifyId',
          student_id: studentId
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setDisplayName(result.name || 'User');
        setStep(2);
      } else {
        setErrorMsg('Student ID not found.');
      }
    } catch (error: any) {
      setErrorMsg('Network error verifying ID.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying) return;

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          student_id: studentId,
          password: password
        })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        localStorage.setItem('currentUser', JSON.stringify({
          student_id: studentId,
          role: data.role,
          name: data.name,
          balance: data.balance,
          status_val: data.status_val,
          lrn: data.lrn,
          dob: data.dob,
          age: data.age,
          sex: data.sex,
          contact: data.contact
        }));

        await Swal.fire({
          title: 'Login Successful!',
          text: 'Welcome to your Student Portal.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        if (data.role === 'admin') router.push('/admin');
        else if (data.role === 'staff') router.push('/staff');
        else router.push('/student');
      } else {
        setErrorMsg(data.message || 'Incorrect Password');
      }
    } catch (error: any) {
      setErrorMsg('Network Error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Image with Blur and Overlay */}
      <div 
        className="fixed inset-0 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat blur-[5px] scale-110 -z-20"
      ></div>
      <div className="fixed inset-0 bg-black/50 -z-10"></div>

      {/* Headline */}
      {!showAbout && (
        <div className="absolute top-[8%] w-full text-center px-5 z-10 animate-fade-in-up">
          <h1 className="text-white text-3xl md:text-5xl font-bold tracking-wide drop-shadow-2xl">
            Making payment easier with School Portal
          </h1>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-wrap items-center justify-center gap-10 p-5 z-10 w-full max-w-[900px]">
        {/* Logo */}
        <div className="flex justify-center items-center flex-1 min-w-[300px] max-w-[350px] animate-fade-in-up">
          <Image 
            src="/logo.png" 
            alt="Saint Patrick Academy Logo" 
            width={350} 
            height={350}
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>

        {/* Auth / About Container */}
        <div className="flex-1 min-w-[350px] max-w-[450px] animate-fade-in-up">
          {showAbout ? (
            <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] p-10 text-gray-800 flex flex-col">
              <h2 className="text-[#008751] text-center mb-5 font-bold text-2xl">Saint Patrick's Academy</h2>
              
              <div className="space-y-2 mb-5">
                <p className="text-[15px]"><strong>Location:</strong> Dingalan, Aurora</p>
                <p className="text-[15px]"><strong>Founded:</strong> 1968</p>
              </div>
              
              <div className="h-px bg-gray-300 my-5"></div>
              
              <h3 className="text-[#008751] text-lg font-semibold mb-1">Vision</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                To provide holistic formation for students inspired by the Blessed Trinity and in communion with the family, church, and community.
              </p>
              
              <h3 className="text-[#008751] text-lg font-semibold mb-1">Mission</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
                Following Jesus Christ through living the Carmelian spirit of prayer, compassion, and prophetic action to provide quality education for the church and society.
              </p>
              
              <button 
                onClick={() => setShowAbout(false)}
                className="mt-5 bg-[#e63946] hover:bg-[#d62828] text-white font-semibold py-3 px-4 rounded-[10px] flex items-center justify-center transition-all hover:-translate-y-1 w-full"
              >
                <X size={18} className="mr-2" /> Exit About Section
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] p-10 flex flex-col">
              <h2 className="text-white text-center mb-8 font-semibold text-2xl tracking-wide">Student Login</h2>
              
              {errorMsg && (
                <div className="bg-[#ff4d4d]/10 border-l-4 border-[#ff4d4d] text-[#ff4d4d] p-3 text-[13px] mb-5 rounded">
                  {errorMsg}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleVerifyId} className="flex flex-col w-full">
                  <div className="relative mb-6">
                    <User className="absolute left-[15px] top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" size={16} />
                    <input 
                      type="text" 
                      placeholder="Student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full py-[15px] pl-[45px] pr-[15px] bg-white/5 border border-white/20 rounded-[10px] outline-none text-white text-[15px] transition-all focus:bg-white/10 focus:border-[#10af33] focus:shadow-[0_0_10px_rgba(16,175,51,0.3)] placeholder:text-white/60"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-br from-[#10af33] to-[#0a8224] hover:from-[#12c73a] hover:to-[#0c9c2c] text-white font-semibold py-[15px] rounded-[10px] transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(16,175,51,0.3)] hover:shadow-[0_6px_20px_rgba(16,175,51,0.5)] flex items-center justify-center"
                  >
                    {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Next'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="flex flex-col w-full animate-fade-in-up">
                  <div className="text-white font-medium text-center mb-[15px] mt-[15px] text-[16px] tracking-wide flex justify-center items-center">
                    <CheckCircle className="text-[#4ade80] mr-2" size={18} /> Welcome, {displayName}!
                  </div>

                  <div className="relative mb-6">
                    <Lock className="absolute left-[15px] top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" size={16} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                      className="w-full py-[15px] pl-[45px] pr-[45px] bg-white/5 border border-white/20 rounded-[10px] outline-none text-white text-[15px] transition-all focus:bg-white/10 focus:border-[#10af33] focus:shadow-[0_0_10px_rgba(16,175,51,0.3)] placeholder:text-white/60"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-[15px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-br from-[#10af33] to-[#0a8224] hover:from-[#12c73a] hover:to-[#0c9c2c] text-white font-semibold py-[15px] rounded-[10px] transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(16,175,51,0.3)] hover:shadow-[0_6px_20px_rgba(16,175,51,0.5)] flex items-center justify-center"
                  >
                    {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                  </button>

                  <div className="text-center mt-5">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-white/80 hover:text-white hover:underline text-[14px] transition-all flex justify-center items-center w-full"
                    >
                      <ArrowLeft size={14} className="mr-2" /> Not you? Change ID
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      {!showAbout && (
        <div className="absolute bottom-[30px] w-full text-center z-10 animate-fade-in-up">
          <button 
            onClick={() => setShowAbout(true)}
            className="text-white/90 hover:text-white hover:underline font-medium text-[15px] drop-shadow-md transition-opacity"
          >
            <Info size={14} className="inline mr-1" /> About Saint Patrick's Academy
          </button>
        </div>
      )}
    </div>
  );
}
