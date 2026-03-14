'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-800/60 bg-ink-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-violet rounded-lg flex items-center justify-center group-hover:bg-violet-dark transition-colors">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">
            <span className="text-ink-50">AI</span>
            <span className="text-violet"> Verify</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-ink-400 hover:text-ink-200 text-sm transition-colors">
            Check Text
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-ink-400 hover:text-ink-200 text-sm transition-colors">
                My Reports
              </Link>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <span style={{fontSize:'13px', color:'#818cf8'}}>👤 {user.name}</span>
                <button
                  onClick={handleLogout}
                  style={{padding:'6px 14px', background:'rgba(255,77,109,0.15)', border:'1px solid rgba(255,77,109,0.3)', borderRadius:'8px', color:'#ff4d6d', fontSize:'13px', cursor:'pointer'}}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              style={{padding:'6px 16px', background:'rgba(129,140,248,0.15)', border:'1px solid rgba(129,140,248,0.3)', borderRadius:'8px', color:'#818cf8', fontSize:'13px', textDecoration:'none'}}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}