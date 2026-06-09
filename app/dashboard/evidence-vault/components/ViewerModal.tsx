'use client';

import { useState } from 'react';

interface Props {
  fileUrl: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
  onDownload: (url: string, name: string) => void;
}

export default function ViewerModal({ fileUrl, fileName, fileType, onClose, onDownload }: Props) {
  const [loading, setLoading] = useState(true);
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';
  const isAudio = fileType === 'audio';
  const isPdf = fileType === 'pdf';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <p className="text-sm font-medium text-white truncate max-w-[60%]">{fileName}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(fileUrl, fileName)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-download-line text-sm"></i>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 min-h-[300px] bg-black/40">
          {isImage && (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onLoad={() => setLoading(false)}
            />
          )}
          {isVideo && (
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-[70vh] rounded-lg"
              onLoadedData={() => setLoading(false)}
            />
          )}
          {isAudio && (
            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-mic-line text-gray-400 text-4xl"></i>
              </div>
              <audio src={fileUrl} controls className="w-full max-w-md" onLoadedData={() => setLoading(false)} />
            </div>
          )}
          {isPdf && (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] rounded-lg border border-gray-800"
              onLoad={() => setLoading(false)}
            />
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-text-line text-gray-400 text-4xl"></i>
              </div>
              <p className="text-sm text-gray-400">Preview not available for this file type</p>
              <button
                onClick={() => onDownload(fileUrl, fileName)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                Download File
              </button>
            </div>
          )}
          {loading && (isImage || isVideo || isPdf) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}