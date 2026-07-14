"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[3000] flex bg-[#f4f4f5] text-gray-900 font-sans print:static print:block print:bg-white">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside className={`fixed md:relative z-50 h-full w-[280px] bg-[#0a0a0a] text-white flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#98202E]/40 to-transparent pointer-events-none" />
        
        <div className="p-8 pt-10 relative z-10">
          <h2 className="text-2xl font-serif font-black tracking-widest uppercase mb-1 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[#98202E] flex items-center justify-center shadow-lg shadow-[#98202E]/20">
              <img src="/g_g_logo_bg-removebg-preview.png" alt="Logo" className="w-5 h-5 invert brightness-0" />
            </span>
            Admin
          </h2>
          <p className="text-xs text-white/50 tracking-widest uppercase mt-2">Glaze & Gear Workspace</p>
        </div>

        <nav className="flex-1 px-4 py-2 flex flex-col gap-2 relative z-10 overflow-y-auto pb-8">
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin' ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname === '/admin' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>📊</span>
            <span className="font-medium text-sm tracking-wide">Dashboard</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/products" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/products') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/products') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>📦</span>
            <span className="font-medium text-sm tracking-wide">Products</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/inventory" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/inventory') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/inventory') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>🏷️</span>
            <span className="font-medium text-sm tracking-wide">Inventory</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/orders" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/orders') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/orders') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>🛒</span>
            <span className="font-medium text-sm tracking-wide">Orders</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/promos" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/promos') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/promos') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>🎟️</span>
            <span className="font-medium text-sm tracking-wide">Promos</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/customers" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/customers') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/customers') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>👥</span>
            <span className="font-medium text-sm tracking-wide">Customers</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/reviews" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/reviews') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/reviews') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>⭐</span>
            <span className="font-medium text-sm tracking-wide">Reviews</span>
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/newsletter" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname?.startsWith('/admin/newsletter') ? 'bg-white/10 translate-x-1' : 'hover:bg-white/10 hover:translate-x-1'}`}>
            <span className={`text-lg transition-opacity ${pathname?.startsWith('/admin/newsletter') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>📧</span>
            <span className="font-medium text-sm tracking-wide">Newsletter</span>
          </Link>
          
          <div className="mt-8 mb-4 border-t border-white/10" />
          
          <Link href="/" className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-[2px]">
            <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">👁️</span>
            <span className="font-medium text-sm tracking-wide">View Store</span>
          </Link>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="group flex items-center gap-3 px-4 py-3 mt-2 rounded-xl border border-transparent hover:bg-red-500/10 hover:border-red-500/20 text-red-400 hover:text-red-300 transition-all text-left w-full"
          >
            <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">🚪</span>
            <span className="font-medium text-sm tracking-wide">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f4f5] print:h-auto print:overflow-visible print:bg-white print:block">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-200 print:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 text-gray-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 font-serif font-black tracking-widest uppercase">Admin</h1>
        </div>

        <div className="flex-1 p-6 md:p-12 overflow-y-auto print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
