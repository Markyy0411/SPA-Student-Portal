const fs = require('fs');

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix CORS headers
  content = content.replace(/\s*headers:\s*\{\s*'Content-Type':\s*'text\/plain;charset=utf-8',?\s*\},/g, '');

  // Fix return null -> Loader2
  content = content.replace(
    'if (!currentUser) return null;',
    `if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-white w-12 h-12 mb-4" />
        <p className="text-gray-300 font-medium">Loading portal...</p>
      </div>
    );
  }`
  );

  // Apply Glassmorphism Global Background
  content = content.replace(
    '<div className="min-h-screen bg-gray-50 flex flex-col font-sans">',
    `<div className="min-h-screen font-sans relative overflow-x-hidden text-gray-100 flex flex-col">
      <div className="fixed inset-0 bg-[url('/bghome.jpg')] bg-cover bg-center bg-fixed -z-10"></div>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] -z-10"></div>`
  );

  // Nav bar glassmorphism
  content = content.replace(
    '<nav className="bg-[#1d4ed8] text-white shadow-lg sticky top-0 z-50">',
    '<nav className="bg-white/10 backdrop-blur-md text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/20 sticky top-0 z-50">'
  );

  // Content cards / panels
  content = content.replace(/bg-white rounded-2xl shadow-sm border border-gray-200/g, 'bg-white/10 backdrop-blur-[15px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 text-white');

  // Specific panel inner fixes (text colors, table bg, inner divs)
  content = content.replace(/text-gray-900/g, 'text-white');
  content = content.replace(/text-gray-800/g, 'text-white');
  content = content.replace(/text-gray-700/g, 'text-gray-200');
  content = content.replace(/text-gray-600/g, 'text-gray-300');
  content = content.replace(/text-gray-500/g, 'text-gray-300');
  
  // Manage Users table
  content = content.replace(/bg-gray-50 text-gray-700/g, 'bg-white/10 text-white border-b border-white/20');
  content = content.replace(/border-gray-100 hover:bg-gray-50/g, 'border-white/10 hover:bg-white/5');
  content = content.replace(/border-gray-200/g, 'border-white/20');
  
  // Forms and Inputs
  content = content.replace(/bg-white border border-gray-300/g, 'bg-black/20 border border-white/20 text-white');
  content = content.replace(/border border-gray-300/g, 'border border-white/20 bg-black/20 text-white');

  // Card icons
  content = content.replace(/bg-blue-50/g, 'bg-blue-500/20');
  content = content.replace(/bg-green-50/g, 'bg-green-500/20');
  content = content.replace(/bg-gray-100/g, 'bg-gray-500/20');
  content = content.replace(/bg-purple-50/g, 'bg-purple-500/20');
  content = content.replace(/bg-orange-50/g, 'bg-orange-500/20');
  content = content.replace(/bg-red-50/g, 'bg-red-500/20');
  
  // Specific icon colors
  content = content.replace(/text-gray-600/g, 'text-gray-300');

  // Arrow left
  content = content.replace(/text-gray-500 hover:text-gray-800/g, 'text-gray-300 hover:text-white');

  // Input background (like the balance input, status select)
  content = content.replace(/w-24 outline-none/g, 'w-24 outline-none bg-transparent');
  content = content.replace(/w-28 outline-none/g, 'w-28 outline-none bg-transparent');
  content = content.replace(/option value/g, 'option className="text-black" value');

  fs.writeFileSync(filePath, content);
  console.log('Transformed', filePath);
}

['src/app/admin/page.tsx', 'src/app/staff/page.tsx', 'src/app/student/page.tsx'].forEach(transformFile);
