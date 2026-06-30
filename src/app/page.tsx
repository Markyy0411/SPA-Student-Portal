"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, CheckCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Auto-verify Student ID
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 1 && studentId.trim().length >= 4 && !isVerifying && !errorMsg) {
        handleVerifyId();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [studentId, step]);

  // Auto-verify Password
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
    if (isVerifying || !studentId.trim()) return;
    
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('student_id', studentId)
        .single();
      
      if (error || !data) {
        setErrorMsg('Student ID not found.');
      } else {
        setDisplayName(data.name || 'User');
        setStep(2);
      }
    } catch (error: any) {
      setErrorMsg('Network error verifying ID.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying || !password.trim()) return;

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('student_id', studentId)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        setErrorMsg('Incorrect Password');
      } else {
        localStorage.setItem('currentUser', JSON.stringify(data));

        await Swal.fire({
          title: 'Login Successful!',
          text: 'Welcome to your portal.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        if (data.role === 'admin') router.push('/admin');
        else if (data.role === 'staff') router.push('/staff');
        else router.push('/student');
      }
    } catch (error: any) {
      setErrorMsg('Network Error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/bghome.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <Image 
            src="/logo.png" 
            alt="School Logo" 
            width={100} 
            height={100} 
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-green-700 tracking-tight">Student Portal</h1>
          <p className="text-gray-500 mt-2 text-sm">Secure access to your records</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 text-center shadow-sm animate-pulse">
            {errorMsg}
          </div>
        )}

        {step === 2 && displayName && (
          <div className="bg-green-600 text-white p-3 rounded-lg text-sm font-medium mb-6 flex items-center justify-center shadow-md animate-fade-in-up">
            <CheckCircle className="w-4 h-4 mr-2" />
            Welcome, {displayName}!
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyId} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-gray-700 font-medium"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
              {isVerifying ? 'Checking...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-gray-700 font-medium"
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
              {isVerifying ? 'Verifying...' : 'Sign In'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setStudentId('');
                  setPassword('');
                  setErrorMsg('');
                }}
                className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors"
              >
                Not you? Change ID
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
