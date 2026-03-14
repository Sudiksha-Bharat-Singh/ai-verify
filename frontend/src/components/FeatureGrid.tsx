'use client';

import { motion } from 'framer-motion';
import { Shield, Brain, FileSearch, Download, Zap, Lock } from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Sentence-Level Detection',
    description: 'Every sentence is individually checked against billions of web pages using Bing Search.',
    color: '#6366f1',
  },
  {
    icon: Brain,
    title: 'AI Content Detection',
    description: 'HuggingFace RoBERTa model identifies AI-generated text with probability scoring.',
    color: '#a78bfa',
  },
  {
    icon: Shield,
    title: 'Source Attribution',
    description: 'Every match is linked to its original source with similarity scores and snippets.',
    color: '#22c55e',
  },
  {
    icon: Download,
    title: 'PDF Reports',
    description: 'Download professional PDF reports with highlighted text and source references.',
    color: '#f97316',
  },
  {
    icon: Zap,
    title: 'Multi-Format Upload',
    description: 'Upload PDF, DOCX, or TXT files. Drag & drop or paste text directly.',
    color: '#06b6d4',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Rate-limited API, input sanitization, and no permanent text storage by default.',
    color: '#ec4899',
  },
];

export function FeatureGrid() {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {features.map((feat, idx) => {
        const Icon = feat.icon;
        return (
          <motion.div
            key={idx}
            className="glass-light rounded-xl p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.07 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${feat.color}18` }}
            >
              <Icon size={17} style={{ color: feat.color }} />
            </div>
            <h3 className="text-ink-100 font-semibold text-sm mb-1">{feat.title}</h3>
            <p className="text-ink-500 text-xs leading-relaxed">{feat.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
