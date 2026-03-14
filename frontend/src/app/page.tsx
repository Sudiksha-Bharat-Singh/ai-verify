'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDropZone } from '@/components/FileDropZone';
import { TextInput } from '@/components/TextInput';
import { Navbar } from '@/components/layout/Navbar';
import { FeatureGrid } from '@/components/FeatureGrid';
import { api } from '@/lib/api';
import { Zap } from 'lucide-react';

type InputMode = 'file' | 'text';

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const handleTextSubmit = async (text: string) => {
    setError(null);
    setIsLoading(true);
    try {
      setProgress(10);
      setProgressLabel('Analyzing text structure...');
      setProgress(30);
      setProgressLabel('Searching for matching content...');
      const result = await api.checkPlagiarism(text, undefined, 'TEXT');
      setProgress(80);
      setProgressLabel('Detecting AI-generated content...');
      setProgress(95);
      setProgressLabel('Building report...');
      await new Promise(r => setTimeout(r, 300));
      setProgress(100);
      sessionStorage.setItem('report', JSON.stringify(result));
      router.push(`/results/${result.reportId}`);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      setProgress(10);
      setProgressLabel('Uploading file...');
      const uploadResult = await api.uploadFile(file);
      setProgress(30);
      setProgressLabel('Extracting text...');
      await new Promise(r => setTimeout(r, 500));
      setProgress(45);
      setProgressLabel('Searching for matching content...');
      const result = await api.checkPlagiarism(uploadResult.extractedText, uploadResult.originalName || undefined, 'FILE');
      setProgress(85);
      setProgressLabel('Detecting AI-generated content...');
      await new Promise(r => setTimeout(r, 300));
      setProgress(100);
      sessionStorage.setItem('report', JSON.stringify(result));
      router.push(`/results/${result.reportId}`);
    } catch (err: any) {
      setError(err.message || 'File processing failed. Please try again.');
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 grid-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-violet/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative max-w-5xl mx-auto px-4 pt-16 pb-24">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className="inline-flex items-center gap-2 bg-violet/10 border border-violet/20 rounded-full px-4 py-1.5 mb-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Zap size={13} className="text-violet" />
            <span className="text-xs font-semibold text-violet-light tracking-widest uppercase">AI-Powered Analysis</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-5">
            <span className="text-ink-50">Detect </span>
            <span className="text-gradient">Plagiarism</span>
            <br />
            <span className="text-ink-50">& AI Content</span>
          </h1>
          <p className="text-ink-300 text-lg max-w-xl mx-auto leading-relaxed">
            Advanced sentence-level analysis with real-time web search, source attribution, and AI generation probability scoring.
          </p>
        </motion.div>

        <motion.div className="glass rounded-2xl p-6 sm:p-8 glow-violet" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex bg-ink-900 rounded-xl p-1 mb-6 w-fit">
            {(['text', 'file'] as InputMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m ? 'bg-violet text-white shadow-lg shadow-violet/30' : 'text-ink-400 hover:text-ink-200'}`}>
                {m === 'text' ? '✏️ Paste Text' : '📄 Upload File'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <ProgressOverlay progress={progress} label={progressLabel} />
            ) : mode === 'text' ? (
              <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TextInput onSubmit={handleTextSubmit} />
              </motion.div>
            ) : (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FileDropZone onFileAccepted={handleFileUpload} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <FeatureGrid />
      </main>
    </div>
  );
}

function ProgressOverlay({ progress, label }: { progress: number; label: string }) {
  return (
    <motion.div className="flex flex-col items-center justify-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="relative w-20 h-20 mb-8">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e2040" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-violet font-bold text-sm font-mono">{progress}%</span>
        </div>
      </div>
      <p className="text-ink-300 text-sm mb-2">{label}</p>
      <p className="text-ink-500 text-xs">This may take up to 30 seconds</p>
      <div className="mt-6 w-64 h-px bg-ink-800 relative overflow-hidden rounded">
        <motion.div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-violet to-transparent" animate={{ x: [-128, 256] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
      </div>
    </motion.div>
  );
}
