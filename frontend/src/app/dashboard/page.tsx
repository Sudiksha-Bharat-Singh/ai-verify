'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(stored));
    fetchReports(token);
  }, []);

  const fetchReports = async (token: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/my-reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getScoreColor = (score: number) =>
    score > 60 ? '#ff4d6d' : score > 30 ? '#fbbf24' : '#4ade80';

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>AI <strong>Verify</strong></span>
        </Link>
        <Link href="/" style={styles.newBtn}>+ New Analysis</Link>
      </header>

      <main style={styles.main}>
        {/* Title */}
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.title}>My <span style={styles.titleAccent}>Reports</span></h1>
            <p style={styles.subtitle}>Welcome back, {user?.name} 👋</p>
          </div>
          <Link href="/" style={styles.analyzeBtn}>+ New Analysis</Link>
        </div>

        {/* Reports */}
        {loading ? (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={styles.empty}>
            <p style={{fontSize:'48px', marginBottom:'16px'}}>📄</p>
            <p style={{color:'#888', fontSize:'16px', marginBottom:'24px'}}>No reports yet</p>
            <Link href="/" style={styles.analyzeBtn}>Check your first document</Link>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>File / Type</th>
                  <th style={styles.th}>Plagiarism</th>
                  <th style={styles.th}>AI Score</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => (
                  <tr key={report.id} style={styles.tr}>
                    <td style={styles.td}>{formatDate(report.createdAt)}</td>
                    <td style={styles.td}>
                      <span style={styles.fileTag}>
                        {report.fileName || 'Text Input'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{...styles.score, color: getScoreColor(report.plagiarismScore)}}>
                        {report.plagiarismScore?.toFixed(1)}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{...styles.score, color: getScoreColor(report.aiScore)}}>
                        {report.aiScore?.toFixed(1)}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: report.status === 'COMPLETED' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
                        color: report.status === 'COMPLETED' ? '#4ade80' : '#fbbf24',
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link href={`/results/${report.id}`} style={styles.viewBtn}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: any = {
  page: { minHeight: '100vh', background: '#07070f', color: 'white', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  bgGlow1: { position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  bgGlow2: { position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' },
  logoIcon: { fontSize: '24px', color: '#818cf8' },
  logoText: { fontSize: '18px', color: 'white' },
  newBtn: { padding: '8px 16px', background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '8px', color: '#818cf8', textDecoration: 'none', fontSize: '14px' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '300', margin: '0 0 8px' },
  titleAccent: { color: '#818cf8', fontWeight: '700' },
  subtitle: { fontSize: '14px', color: '#666', margin: 0 },
  analyzeBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', borderRadius: '10px', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(129,140,248,0.2)', borderTop: '2px solid #818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#555', fontSize: '14px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' },
  tableWrap: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 20px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', color: '#555', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: '600' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' },
  td: { padding: '16px 20px', fontSize: '14px', color: '#ccc' },
  fileTag: { fontSize: '13px', color: '#888' },
  score: { fontSize: '16px', fontWeight: '700' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  viewBtn: { color: '#818cf8', textDecoration: 'none', fontSize: '13px', fontWeight: '600' },
};