'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SentenceResult } from '@/lib/api';
import { ExternalLink, X } from 'lucide-react';

interface HighlightedTextProps {
  sentences: SentenceResult[];
}

export function HighlightedText({ sentences }: HighlightedTextProps) {
  const [activeSource, setActiveSource] = useState<{ url: string; title: string; score: number } | null>(null);

  if (!sentences?.length) {
    return <p className="text-ink-500 text-sm italic">No text available</p>;
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-red-500/30 border-b border-red-500/60 inline-block" />
          Plagiarized
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-ink-800 inline-block" />
          Original
        </span>
      </div>

      {/* Text */}
      <div className="text-ink-200 text-sm leading-8 font-mono">
        {sentences.map((sentence, idx) => (
          <span key={idx}>
            {sentence.isPlagiarized ? (
              <span
                className="highlight-plagiarized cursor-pointer relative"
                onClick={() => setActiveSource(
                  activeSource?.url === sentence.matchedSource?.url
                    ? null
                    : {
                        url: sentence.matchedSource!.url,
                        title: sentence.matchedSource!.title,
                        score: sentence.similarityScore,
                      }
                )}
                title={`${Math.round(sentence.similarityScore * 100)}% similar · Click to see source`}
              >
                {sentence.text}
                <sup className="text-red-400 text-xs ml-0.5 not-italic font-sans">
                  {Math.round(sentence.similarityScore * 100)}%
                </sup>
              </span>
            ) : (
              <span>{sentence.text}</span>
            )}
            {' '}
          </span>
        ))}
      </div>

      {/* Source tooltip */}
      <AnimatePresence>
        {activeSource && (
          <motion.div
            className="mt-4 p-4 bg-ink-900 border border-red-500/20 rounded-xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Matched Source · {Math.round(activeSource.score * 100)}% similarity
                </p>
                <p className="text-ink-200 text-sm font-semibold truncate">{activeSource.title}</p>
                <a
                  href={activeSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-light text-xs hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink size={11} />
                  {activeSource.url.slice(0, 60)}...
                </a>
              </div>
              <button
                onClick={() => setActiveSource(null)}
                className="text-ink-500 hover:text-ink-300"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
