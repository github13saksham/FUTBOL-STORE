const fs = require('fs');
let content = fs.readFileSync('src/app/account/page.tsx', 'utf8');

// Container
content = content.replace(
  'className="min-h-screen text-luxury-dark bg-[#FFEEE2] selection:bg-luxury-taupe selection:text-luxury-dark flex"',
  'className="min-h-screen text-white bg-black selection:bg-luxury-taupe selection:text-black flex flex-col lg:flex-row pb-20 lg:pb-0"'
);

// Desktop Sidebar
content = content.replace(
  'className="hidden lg:flex w-72 flex-shrink-0 sticky top-0 h-screen bg-black border-r border-white/5 z-40 flex-col pt-32 px-4 pb-6 space-y-2 overflow-y-auto shadow-2xl"',
  'className="hidden lg:flex w-72 flex-shrink-0 sticky top-0 h-screen bg-black border-r border-white/10 z-40 flex-col pt-32 px-4 pb-6 space-y-2 overflow-y-auto shadow-2xl"'
);

content = content.replace(
  'className="hidden lg:flex w-72 flex-shrink-0 sticky top-0 h-screen bg-black/95 border-r border-luxury-sand/10 z-40 flex-col pt-32 px-4 pb-6 space-y-2 overflow-y-auto shadow-2xl"',
  'className="hidden lg:flex w-72 flex-shrink-0 sticky top-0 h-screen bg-black border-r border-white/10 z-40 flex-col pt-32 px-4 pb-6 space-y-2 overflow-y-auto shadow-2xl"'
);

// Mobile Sidebar -> fully black on the left side / top list
content = content.replace(
  '<div className="lg:hidden px-6 pt-32 pb-8 w-full">\n        <div className="space-y-2 bg-black/95 p-4 rounded-3xl shadow-xl border border-luxury-sand/10 mb-8">',
  '<div className="lg:hidden w-full bg-black pt-24 px-4 pb-4 border-b border-white/10">\n        <div className="flex flex-col border border-white/10 rounded-2xl overflow-hidden">'
);

// Mobile sidebar buttons
content = content.replace(/text-left px-6 py-4 rounded-xl text-\[10px\] uppercase tracking-widest font-bold flex justify-between items-center transition-all backdrop-blur-md border/g, 'text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5');

// Update active states for mobile sidebar buttons
content = content.replace(/activeTab === "[a-z]+" \? "bg-white\/10 text-luxury-ivory border-white\/20 shadow-\[0_8px_32px_0_rgba\(255,255,255,0\.05\)\]" : "hover:bg-white\/10 text-luxury-ivory\/60 hover:text-luxury-ivory border-transparent hover:border-white\/20 hover:shadow-\[0_8px_32px_0_rgba\(255,255,255,0\.05\)\]"/g, '"text-white"');

content = content.replace(/activeTab === "[a-z]+" \? "bg-white\/10 text-luxury-ivory border-white\/20" : "text-luxury-ivory\/60 border-transparent hover:bg-white\/5 hover:text-luxury-ivory"/g, '"text-white"');

// Header
content = content.replace(
  'className="max-w-5xl mx-auto px-6 md:px-12 mb-16 text-center lg:text-left"',
  'className="max-w-5xl mx-auto px-6 md:px-12 mb-8 text-left"'
);

content = content.replace(/text-luxury-dark/g, 'text-white');
content = content.replace(/text-luxury-ivory/g, 'text-white');
content = content.replace(/bg-\[#FFEEE2\]\/60 backdrop-blur-md/g, 'bg-[#121212]');
content = content.replace(/bg-\[#FFEEE2\]\/40/g, 'bg-black/50');
content = content.replace(/border-luxury-taupe\/10/g, 'border-white/10');
content = content.replace(/border-luxury-taupe\/20/g, 'border-white/10');
content = content.replace(/border-luxury-taupe\/30/g, 'border-white/30');
content = content.replace(/border-luxury-taupe\/5/g, 'border-white/5');
content = content.replace(/text-luxury-taupe/g, 'text-white/50');

fs.writeFileSync('src/app/account/page.tsx', content);
console.log('Account page updated to dark mode');
