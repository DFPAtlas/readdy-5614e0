'use client';

import { useState, useEffect } from 'react';

interface VoiceCommandsProps {
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

export default function VoiceCommands({ voiceActive, setVoiceActive }: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState([
    { command: 'Show me site status', result: 'Displayed status for all 6 sites', time: '2 mins ago' },
    { command: 'Call guard at Industrial Park', result: 'Initiated AI check-call to Mike Wilson', time: '5 mins ago' },
    { command: 'Generate incident report', result: 'Created incident report for last 24 hours', time: '10 mins ago' }
  ]);

  const availableCommands = [
    { 
      category: 'Site Management',
      commands: [
        { phrase: 'Show site status', description: 'Display current status of all sites' },
        { phrase: 'Check [site name]', description: 'Get detailed information about a specific site' },
        { phrase: 'List active alerts', description: 'Show all current alerts and warnings' }
      ]
    },
    {
      category: 'Staff Operations',
      commands: [
        { phrase: 'Call guard at [site]', description: 'Initiate AI check-call to guard at specified site' },
        { phrase: 'Staff overview', description: 'Display current staff status and assignments' },
        { phrase: 'Schedule patrol', description: 'Set up new patrol schedule' }
      ]
    },
    {
      category: 'Reports & Analytics',
      commands: [
        { phrase: 'Generate report', description: 'Create various types of security reports' },
        { phrase: 'Show incidents', description: 'Display recent incident summary' },
        { phrase: 'Performance analytics', description: 'Show staff and site performance metrics' }
      ]
    }
  ];

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript('Listening...');
    
    setTimeout(() => {
      setTranscript('Processing voice command...');
      setTimeout(() => {
        const mockCommands = [
          'Show me the status of all sites',
          'Call guard at City Centre Mall',
          'Generate daily incident report',
          'Check staff assignments'
        ];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(randomCommand);
        
        const newCommand = {
          command: randomCommand,
          result: 'Command executed successfully',
          time: 'Just now'
        };
        setCommandHistory(prev => [newCommand, ...prev]);
        
        setTimeout(() => {
          setIsListening(false);
          setTranscript('');
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const handleStopListening = () => {
    setIsListening(false);
    setTranscript('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-6">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening ? 'bg-red-100 border-4 border-red-500 animate-pulse' : 'bg-blue-100 border-4 border-blue-500'
          }`}>
            <i className={`${isListening ? 'ri-mic-fill' : 'ri-mic-line'} text-6xl ${
              isListening ? 'text-red-600' : 'text-blue-600'
            }`}></i>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Command Status</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            voiceActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${voiceActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            {voiceActive ? 'Voice Commands Active' : 'Voice Commands Disabled'}
          </div>
        </div>

        <div className="mb-6">
          {transcript && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">Recognized:</div>
              <div className="text-gray-900 font-medium">{transcript}</div>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleStartListening}
              disabled={isListening || !voiceActive}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              {isListening ? 'Listening...' : 'Start Voice Command'}
            </button>
            
            {isListening && (
              <button
                onClick={handleStopListening}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Stop Listening
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={voiceActive}
              onChange={(e) => setVoiceActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable Voice Commands</span>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Commands</h3>
          <div className="space-y-4">
            {availableCommands.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.commands.map((cmd, cmdIndex) => (
                    <div key={cmdIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">"{cmd.phrase}"</div>
                        <div className="text-xs text-gray-600">{cmd.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Commands</h3>
          <div className="space-y-3">
            {commandHistory.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-green-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm mb-1">"{item.command}"</div>
                    <div className="text-xs text-gray-600 mb-1">{item.result}</div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <i className="ri-information-line text-blue-600"></i>
          <h4 className="font-semibold text-blue-900">Voice Command Tips</h4>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Speak clearly and wait for the listening indicator</li>
          <li>• Use natural language - no need for exact phrases</li>
          <li>• Say "Help" to get a list of available commands</li>
          <li>• Commands are processed securely and not stored</li>
        </ul>
      </div>
    </div>
  );
}