'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle } from 'lucide-react';

interface FileDropZoneProps {
  onFileAccepted: (file: File) => void;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

export function FileDropZone({ onFileAccepted }: FileDropZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
  });

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
            ${isDragActive && !isDragReject ? 'border-violet bg-violet/5' : ''}
            ${isDragReject ? 'border-red-500 bg-red-500/5' : ''}
            ${!isDragActive ? 'border-ink-700 hover:border-ink-500 hover:bg-ink-900/50' : ''}
          `}
        >
          <input {...getInputProps()} />

          <motion.div
            animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4
              ${isDragActive && !isDragReject ? 'bg-violet/20' : 'bg-ink-800'}`}
            >
              <Upload size={24} className={isDragActive ? 'text-violet' : 'text-ink-400'} />
            </div>

            {isDragActive ? (
              <p className="text-violet font-semibold">Drop your file here</p>
            ) : (
              <>
                <p className="text-ink-200 font-semibold mb-1">
                  Drag & drop your file here
                </p>
                <p className="text-ink-500 text-sm mb-4">or click to browse</p>
                <div className="flex items-center justify-center gap-2">
                  {['PDF', 'DOCX', 'TXT'].map(ext => (
                    <span key={ext} className="px-2.5 py-0.5 bg-ink-800 rounded text-xs text-ink-400 font-mono">
                      .{ext.toLowerCase()}
                    </span>
                  ))}
                  <span className="text-ink-600 text-xs">· Max 10MB</span>
                </div>
              </>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="border border-ink-700 rounded-xl p-6"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet/10 border border-violet/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <File size={20} className="text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink-100 font-semibold truncate">{selectedFile.name}</p>
              <p className="text-ink-500 text-sm">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-ink-500 hover:text-ink-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      {selectedFile && (
        <motion.button
          className="w-full mt-4 bg-violet hover:bg-violet-dark text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-violet/20 hover:shadow-violet/40"
          onClick={() => onFileAccepted(selectedFile)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <CheckCircle size={16} className="inline mr-2" />
          Analyze File
        </motion.button>
      )}
    </div>
  );
}
