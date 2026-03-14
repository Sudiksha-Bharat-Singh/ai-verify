'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface AIDetectionCardProps {
  aiScore: number;
  humanScore: number;
}

export function AIDetectionCard({ aiScore, humanScore }: AIDetectionCardProps) {
  const isLikelyAI = aiScore > 70;
  const isMixed = aiScore >= 40 && aiScore <= 70;

  const verdict = isLikelyAI ? 'AI Generated' : isMixed ? 'Possibly AI' : 'Human Written';
  const verdictColor = isLikelyAI ? '#ef4444' : isMixed ? '#f97316' : '#22c55e';

  return (
    <motion.div
      className="glass rounded-2xl p-6 flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-4">
        AI Content Detection
      </p>

      {/* Verdict */}
      <div className="text-center mb-5">
        <div
          className="text-2xl font-black mb-1"
          style={{ color: verdictColor }}
        >
          {verdict}
        </div>
      </div>

      {/* Stacked bar */}
      <div className="mb-4">
        <div className="h-3 bg-ink-800 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-red-500 rounded-l-full"
            initial={{ width: 0 }}
            animate={{ width: `${aiScore}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.div
            className="h-full bg-green-500 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${humanScore}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Bot size={13} className="text-red-400" />
          <span className="text-ink-400">AI: <strong className="text-red-400">{Math.round(aiScore)}%</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-green-400" />
          <span className="text-ink-400">Human: <strong className="text-green-400">{Math.round(humanScore)}%</strong></span>
        </div>
      </div>
    </motion.div>
  );
}
