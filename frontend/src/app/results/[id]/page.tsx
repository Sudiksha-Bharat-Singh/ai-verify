'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResultsPage() {
  const params = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/report/${params.id}/pdf`);
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aiverify-report-${String(params.id).slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF download failed. Please try again.');
    }
  };

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('report');
      if (cached) {
        setReport(JSON.parse(cached));
        setTimeout(() => setAnimate(true), 100);
      } else {
        setError('Report not found. Please go back and try again.');
      }
    } catch (e) {
      setError('Failed to load report.');
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div style={styles.fullCenter}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Analyzing content...</p>
    </div>
  );

  if (error || !report) return (
    <div style={styles.fullCenter}>
      <p style={styles.errorText}>⚠️ {error || 'Report not found'}</p>
      <Link href="/" style={styles.backBtn}>← Go Back Home</Link>
    </div>
  );

  const plagScore = report.plagiarismScore || 0;
  const aiScore = report.aiScore || 0;
  const humanScore = report.humanScore || 100;
  const plagColor = plagScore > 60 ? '#ff4d6d' : plagScore > 30 ? '#fbbf24' : '#4ade80';
  const aiColor = aiScore > 60 ? '#ff4d6d' : aiScore > 30 ? '#fbbf24' : '#818cf8';

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>AI <strong>Verify</strong></span>
        </Link>
        <div style={styles.headerBtns}>
          <Link href="/" style={styles.newBtn}>+ New Analysis</Link>
          <button onClick={handleDownloadPDF} style={styles.downloadBtn}>⬇ Download PDF</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={{...styles.titleRow, opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease'}}>
          <h1 style={styles.title}>Analysis <span style={styles.titleAccent}>Report</span></h1>
          <p style={styles.reportId}>ID: {String(params.id).slice(0, 8)}...</p>
        </div>

        <div style={styles.scoreGrid}>
          <div style={{...styles.scoreCard, opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease 0.1s'}}>
            <p style={styles.cardLabel}>PLAGIARISM SCORE</p>
            <div style={styles.bigScoreWrap}>
              <span style={{...styles.bigScore, color: plagColor}}>{plagScore}</span>
              <span style={{...styles.bigScoreUnit, color: plagColor}}>%</span>
            </div>
            <div style={styles.scoreBar}>
              <div style={{...styles.scoreBarFill, width: `${plagScore}%`, background: plagColor}} />
            </div>
            <p style={{...styles.scoreVerdict, color: plagColor}}>
              {plagScore > 60 ? '⚠ High Plagiarism' : plagScore > 30 ? '⚡ Moderate' : '✓ Original Content'}
            </p>
          </div>

          <div style={{...styles.scoreCard, opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease 0.2s'}}>
            <p style={styles.cardLabel}>AI DETECTION</p>
            <div style={styles.aiDonut}>
              <svg viewBox="0 0 100 100" style={{width: '120px', height: '120px'}}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a2e" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={aiColor} strokeWidth="12"
                  strokeDasharray={`${aiScore * 2.51} 251`} strokeLinecap="round"
                  transform="rotate(-90 50 50)" style={{transition: 'stroke-dasharray 1s ease'}} />
                <text x="50" y="45" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{aiScore.toFixed(1)}%</text>
                <text x="50" y="62" textAnchor="middle" fill="#888" fontSize="8">AI Generated</text>
              </svg>
            </div>
            <div style={styles.aiRow}>
              <span style={styles.aiDot('4ade80')} />
              <span style={styles.aiLabel}>Human: <strong style={{color:'#4ade80'}}>{humanScore.toFixed(1)}%</strong></span>
            </div>
            <div style={styles.aiRow}>
              <span style={styles.aiDot(aiColor.replace('#',''))} />
              <span style={styles.aiLabel}>AI: <strong style={{color: aiColor}}>{aiScore.toFixed(1)}%</strong></span>
            </div>
          </div>

          <div style={{...styles.scoreCard, opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease 0.3s'}}>
            <p style={styles.cardLabel}>ANALYSIS STATS</p>
            <div style={styles.statsList}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{report.sentences?.length || 0}</span>
                <span style={styles.statLabel}>Sentences</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>{report.sources?.length || 0}</span>
                <span style={styles.statLabel}>Sources Found</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>{report.sentences?.filter((s:any) => s.isPlagiarized)?.length || 0}</span>
                <span style={styles.statLabel}>Flagged</span>
              </div>
            </div>
          </div>
        </div>

        {report.sources && report.sources.length > 0 && (
          <div style={{...styles.section, opacity: animate ? 1 : 0, transition: 'all 0.6s ease 0.4s'}}>
            <h2 style={styles.sectionTitle}>🔗 Matched Sources</h2>
            <div style={styles.sourceGrid}>
              {report.sources.map((source: any, i: number) => (
                <a key={i} href={source.url} target="_blank" rel="noreferrer" style={styles.sourceCard}>
                  <div style={styles.sourceNum}>#{i + 1}</div>
                  <div style={styles.sourceInfo}>
                    <p style={styles.sourceTitle}>{source.title || 'Unknown Source'}</p>
                    <p style={styles.sourceUrl}>{source.url?.slice(0, 60)}...</p>
                  </div>
                  <div style={styles.sourceMatch}>{source.similarity || '—'}%</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {report.sentences && report.sentences.length > 0 && (
          <div style={{...styles.section, opacity: animate ? 1 : 0, transition: 'all 0.6s ease 0.5s'}}>
            <h2 style={styles.sectionTitle}>📄 Sentence Analysis</h2>
            <div style={styles.textBox}>
              {report.sentences.map((s: any, i: number) => (
                <span key={i} style={{
                  ...styles.sentence,
                  background: s.isPlagiarized ? 'rgba(255,77,109,0.2)' : 'transparent',
                  borderBottom: s.isPlagiarized ? '2px solid #ff4d6d' : '2px solid transparent',
                  borderRadius: '3px',
                }}>
                  {s.text}{' '}
                </span>
              ))}
            </div>
            <div style={styles.legend}>
              <span style={styles.legendItem}><span style={{...styles.legendDot, background:'#ff4d6d'}} /> Plagiarized</span>
              <span style={styles.legendItem}><span style={{...styles.legendDot, background:'#4ade80'}} /> Original</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: any = {
  page: { minHeight: '100vh', background: '#07070f', color: 'white', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' },
  bgGlow1: { position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  bgGlow2: { position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  headerBtns: { display: 'flex', gap: '12px', alignItems: 'center' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' },
  logoIcon: { fontSize: '24px', color: '#818cf8' },
  logoText: { fontSize: '18px', color: 'white' },
  newBtn: { padding: '8px 16px', background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '8px', color: '#818cf8', textDecoration: 'none', fontSize: '14px' },
  downloadBtn: { padding: '8px 16px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', color: '#4ade80', cursor: 'pointer', fontSize: '14px' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  titleRow: { marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '300', margin: 0 },
  titleAccent: { color: '#818cf8', fontWeight: '700' },
  reportId: { color: '#444', fontSize: '13px', fontFamily: 'monospace', marginTop: '8px' },
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' },
  scoreCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', backdropFilter: 'blur(10px)' },
  cardLabel: { fontSize: '11px', letterSpacing: '2px', color: '#555', marginBottom: '16px', margin: '0 0 16px 0' },
  bigScoreWrap: { display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '16px' },
  bigScore: { fontSize: '72px', fontWeight: '700', lineHeight: 1 },
  bigScoreUnit: { fontSize: '32px', fontWeight: '700', marginBottom: '8px' },
  scoreBar: { height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: '2px', transition: 'width 1s ease' },
  scoreVerdict: { fontSize: '13px', fontWeight: '600', margin: 0 },
  aiDonut: { display: 'flex', justifyContent: 'center', margin: '8px 0 16px' },
  aiRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  aiDot: (c: string) => ({ width: '8px', height: '8px', borderRadius: '50%', background: `#${c}`, flexShrink: 0 }),
  aiLabel: { fontSize: '14px', color: '#aaa' },
  statsList: { display: 'flex', flexDirection: 'column', gap: '0', marginTop: '16px' },
  statItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' },
  statNum: { fontSize: '28px', fontWeight: '700', color: '#818cf8' },
  statLabel: { fontSize: '13px', color: '#666' },
  statDivider: { height: '1px', background: 'rgba(255,255,255,0.06)' },
  section: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#ccc' },
  sourceGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sourceCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: 'white', transition: 'border-color 0.2s' },
  sourceNum: { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(129,140,248,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  sourceInfo: { flex: 1, minWidth: 0 },
  sourceTitle: { fontSize: '14px', fontWeight: '500', margin: '0 0 4px', color: '#ddd' },
  sourceUrl: { fontSize: '12px', color: '#555', margin: 0 },
  sourceMatch: { fontSize: '18px', fontWeight: '700', color: '#818cf8', flexShrink: 0 },
  textBox: { lineHeight: '2', fontSize: '15px', color: '#ccc' },
  sentence: { padding: '2px 4px', transition: 'background 0.3s' },
  legend: { display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#666' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%' },
  fullCenter: { minHeight: '100vh', background: '#07070f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(129,140,248,0.2)', borderTop: '2px solid #818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#555', fontSize: '14px' },
  errorText: { color: '#ff4d6d', fontSize: '16px' },
  backBtn: { padding: '10px 20px', background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '8px', color: '#818cf8', textDecoration: 'none' },
};