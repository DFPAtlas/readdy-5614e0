'use client';

import { useState, useEffect } from 'react';
import AIChat from './AIChat';
import AIInsights from './AIInsights';
import VoiceCommands from './VoiceCommands';
import AIReports from './AIReports';
import AISettings from './AISettings';
import SOPChat from './SOPChat';
import { useAvailableSOPs } from '@/lib/useAvailableSOPs';
import { useSOPIndex } from '@/lib/useSOPIndex';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('chat');
  const [aiStatus, setAiStatus] = useState('online');
  const [voiceActive, setVoiceActive] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const { docs: availableSOPs, loading: sopsLoading, refetch: refetchSOPs } = useAvailableSOPs();
  const { isIndexing, progress, error: indexError, indexDocument } = useSOPIndex();
  const [selectedDoc, setSelectedDoc] = useState<string | undefined>();

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: 'ri-chat-3-line' },
    { id: 'sop', label: 'SOP Assistant', icon: 'ri-book-open-line' },
    { id: 'insights', label: 'Smart Insights', icon: 'ri-lightbulb-line' },
    { id: 'voice', label: 'Voice Commands', icon: 'ri-mic-line' },
    { id: 'reports', label: 'AI Reports', icon: 'ri-file-text-line' },
    { id: 'settings', label: 'AI Settings', icon: 'ri-settings-3-line' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingCount(prev => Math.floor(Math.random() * 15) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleIndexDoc = async (docId: string) => {
    const ok = await indexDocument(docId);
    if (ok) refetchSOPs();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return <AIChat />;
      case 'sop':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">SOP Assistant</h2>
                <p className="text-sm text-gray-400">Ask questions about your Standard Operating Procedures</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SOPChat documentId={selectedDoc} />
              </div>
              <div className="space-y-4">
                <div className="bg-[#111827]/80 rounded-xl border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Your Documents</h3>
                    {isIndexing && (
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-violet-400">Indexing {progress}%</span>
                      </div>
                    )}
                  </div>
                  {indexError && (
                    <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2 mb-3">{indexError}</p>
                  )}
                  {sopsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                    </div>
                  ) : availableSOPs.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full mx-auto mb-2">
                        <i className="ri-file-list-3-line text-gray-500 text-lg"></i>
                      </div>
                      <p className="text-xs text-gray-500">No SOP documents found</p>
                      <p className="text-xs text-gray-600 mt-1">Upload documents from site detail pages</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedDoc(undefined)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          !selectedDoc
                            ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                            : 'text-gray-400 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-search-line"></i></div>
                        <span>Search across all documents</span>
                      </button>
                      <div className="border-t border-gray-800 pt-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 px-1">Indexed</p>
                        {availableSOPs.filter(d => d.isIndexed).map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                              selectedDoc === doc.id
                                ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                                : 'text-gray-400 hover:bg-gray-800/50'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-file-text-line"></i></div>
                              <span className="truncate">{doc.title}</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Indexed"></div>
                          </button>
                        ))}
                        {availableSOPs.filter(d => !d.isIndexed).length > 0 && (
                          <>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 mb-1.5 px-1">Not indexed</p>
                            {availableSOPs.filter(d => !d.isIndexed).map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-500"
                              >
                                <div className="flex items-center space-x-2 min-w-0">
                                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-file-text-line"></i></div>
                                  <span className="truncate">{doc.title}</span>
                                </div>
                                <button
                                  onClick={() => handleIndexDoc(doc.id)}
                                  disabled={isIndexing}
                                  className="px-2 py-1 rounded bg-gray-800 hover:bg-violet-600/20 text-gray-400 hover:text-violet-300 text-[10px] transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Index
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-[#111827]/80 rounded-xl border border-gray-800 p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">How it works</h3>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex items-start space-x-2">
                      <div className="w-4 h-4 flex items-center justify-center mt-0.5"><i className="ri-upload-cloud-line text-violet-400"></i></div>
                      <span>Upload SOP documents from any site detail page</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-4 h-4 flex items-center justify-center mt-0.5"><i className="ri-brain-line text-violet-400"></i></div>
                      <span>Click Index to chunk and embed the document text</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-4 h-4 flex items-center justify-center mt-0.5"><i className="ri-question-answer-line text-violet-400"></i></div>
                      <span>Ask questions in natural language — answers come from your documents only</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'insights':
        return <AIInsights />;
      case 'voice':
        return <VoiceCommands voiceActive={voiceActive} setVoiceActive={setVoiceActive} />;
      case 'reports':
        return <AIReports />;
      case 'settings':
        return <AISettings />;
      default:
        return <AIChat />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">AI Security Assistant</h1>
              <p className="text-gray-400">Intelligent automation and insights for your security operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${aiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-300">AI Status: {aiStatus}</span>
              </div>
              <div className="bg-blue-600/15 text-blue-400 px-3 py-1 rounded-full text-sm">
                {processingCount} tasks processing
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111827]/80 rounded-xl border border-gray-800 backdrop-blur-sm">
          <div className="border-b border-gray-800 px-6 py-4">
            <div className="flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <i className={`${tab.icon} text-base`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
}