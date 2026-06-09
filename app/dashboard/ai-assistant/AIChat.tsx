'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI Security Assistant. I can help you with site monitoring, staff management, incident analysis, and more. What would you like to know?',
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: 2,
      type: 'user',
      content: 'What\'s the current status of all my sites?',
      timestamp: new Date(Date.now() - 4000)
    },
    {
      id: 3,
      type: 'ai',
      content: 'Here\'s your current site overview:\n\n✅ **Active Sites**: 4 out of 6 sites\n⚠️ **Warning Sites**: 2 sites (Industrial Park East, Corporate Tower)\n🚨 **Alert Sites**: 1 site (Warehouse District)\n\n**Staff Coverage**: 8 guards on duty across all sites\n**Recent Incidents**: 3 incidents in the last 24 hours\n\nWould you like me to provide more details about any specific site?',
      timestamp: new Date(Date.now() - 3000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { label: 'Site Status Report', icon: 'ri-building-line' },
    { label: 'Staff Overview', icon: 'ri-team-line' },
    { label: 'Recent Incidents', icon: 'ri-alert-line' },
    { label: 'Check-in Analysis', icon: 'ri-time-line' },
    { label: 'Generate Report', icon: 'ri-file-text-line' },
    { label: 'Schedule Patrol', icon: 'ri-route-line' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string) => {
    const responses = {
      'incident': 'I found 3 recent incidents:\n\n🚨 **Warehouse District** - Missed check-in (45 mins ago)\n⚠️ **Industrial Park East** - Minor security breach (2 hours ago)\n⚠️ **Corporate Tower** - Late patrol report (3 hours ago)\n\nWould you like me to provide detailed incident reports?',
      'staff': 'Current staff status:\n\n👥 **Total Staff**: 15 guards\n✅ **On Duty**: 8 guards\n🏠 **Off Duty**: 7 guards\n\n**Top Performers**: John Smith (99% check-in rate), Sarah Johnson (98% check-in rate)\n\nWould you like to see individual staff performance?',
      'report': 'I can generate several types of reports:\n\n📊 **Daily Operations Report**\n📈 **Weekly Performance Analytics**\n🔍 **Incident Analysis Report**\n📋 **Staff Performance Report**\n🎯 **Site Efficiency Report**\n\nWhich report would you like me to create?',
      'default': 'I understand you\'re asking about security operations. I can help with:\n\n• Site monitoring and alerts\n• Staff management and scheduling\n• Incident tracking and analysis\n• Performance reports and analytics\n• AI check-call system management\n\nCould you please be more specific about what you need?'
    };

    const input = userInput.toLowerCase();
    if (input.includes('incident') || input.includes('alert')) return responses.incident;
    if (input.includes('staff') || input.includes('guard')) return responses.staff;
    if (input.includes('report') || input.includes('analytics')) return responses.report;
    return responses.default;
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Quick Actions:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.label)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className={`${action.icon} text-gray-600`}></i>
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything about your security operations..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-send-plane-line"></i>
        </button>
      </div>
    </div>
  );
}