'use client';

import { motion } from 'framer-motion';
import type { SentenceResult } from '@/lib/api';

export function SummaryStats({ sentences }: { sentences: SentenceResult[] }) {
  const total = sentences?.length || 0;
  const plagiarized = sentences?.filter(s => s.isPlagiarized).length || 0;
  const original = total - plagiarized;

  const stats = [
    { label: 'Total Sentences', value: total, color: '#818cf8' },
    { label: 'Plagiarized', value: plagiarized, color: '#ef4444' },
    { label: 'Original', value: original, color: '#22c55e' },
  ];

  return (
    <motion.div
      className="glass rounded-2xl p-6 flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-5">
        Analysis Summary
      </p>

      <div className="space-y-4 flex-1">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-ink-400 text-xs">{stat.label}</span>
              <span className="font-bold text-sm" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
            <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: stat.color }}
                initial={{ width: 0 }}
                animate={{ width: total > 0 ? `${(stat.value / total) * 100}%` : '0%' }}
                transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
