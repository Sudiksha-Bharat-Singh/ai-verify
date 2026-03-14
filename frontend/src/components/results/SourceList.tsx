'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';
import type { SourceResult } from '@/lib/api';

export function SourceList({ sources }: { sources: SourceResult[] }) {
  if (!sources?.length) {
    return (
      <div className="text-center py-8">
        <Globe size={32} className="text-ink-700 mx-auto mb-2" />
        <p className="text-ink-500 text-sm">No matching sources found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.slice(0, 10).map((source, idx) => (
        <motion.div
          key={idx}
          className="p-3 bg-ink-900/60 border border-ink-800 rounded-xl hover:border-ink-600 transition-colors"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-ink-200 text-xs font-semibold line-clamp-2 flex-1">
              {source.title || 'Untitled Source'}
            </p>
            <span className="text-xs font-bold text-red-400 flex-shrink-0 bg-red-500/10 px-1.5 py-0.5 rounded">
              {source.matchCount}×
            </span>
          </div>

          {source.snippet && (
            <p className="text-ink-500 text-xs line-clamp-2 mb-2 leading-relaxed">
              "{source.snippet}"
            </p>
          )}

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-violet-light text-xs hover:underline"
          >
            <ExternalLink size={10} />
            <span className="truncate">{source.url}</span>
          </a>
        </motion.div>
      ))}

      {sources.length > 10 && (
        <p className="text-ink-600 text-xs text-center pt-2">
          +{sources.length - 10} more sources in PDF report
        </p>
      )}
    </div>
  );
}
