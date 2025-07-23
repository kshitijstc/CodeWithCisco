import React from 'react';
import { Bot, Brain, MessageSquare, Zap, Settings, Key, Users, Shield } from 'lucide-react';
import { useAI } from '../contexts/AIContext';
import { meshAgentService } from '../services/meshAgentService';

const CopilotPanel: React.FC = () => {
  const { isActive, currentAnalysis, isAnalyzing, llmProvider, apiKeyConfigured, configureLLM, getEndpointProfiles } = useAI();
  const [showConfig, setShowConfig] = React.useState(false);
  const [tempProvider, setTempProvider] = React.useState<'openai' | 'anthropic' | 'gemini'>(llmProvider);
  const [tempApiKey, setTempApiKey] = React.useState('');
  
  const endpointProfiles = getEndpointProfiles();
  const meshAgents = meshAgentService.getAllAgents();
  const activeAgents = meshAgents.filter(agent => agent.status === 'active');
  const threats = meshAgentService.getAllThreats();
  const autoRemediationActive = meshAgentService.isAutoRemediationActive();

  const handleConfigSave = () => {
    if (tempApiKey.trim()) {
      configureLLM(tempProvider, tempApiKey.trim());
      setShowConfig(false);
      setTempApiKey('');
    }
  };
  const parseAnalysis = (analysis: string) => {
    const sections = analysis.split('### ');
    const parsedSections: Record<string, string> = {};
    
    sections.forEach(section => {
      const lines = section.split('\n');
      const title = lines[0].replace('🔍 ', '').replace('📉 ', '').replace('🛠 ', '').replace('📢 ', '').replace('📬 ', '');
      const content = lines.slice(1).join('\n').trim();
      if (title && content) {
        parsedSections[title] = content;
      }
    });
    
    return parsedSections;
  };

  const renderAnalysisSection = (title: string, content: string, icon: React.ReactNode) => (
    <div className="bg-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <div className="text-sm text-gray-300 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">AI Co-pilot</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Configure LLM"
          >
            <Settings className="h-4 w-4 text-gray-400" />
          </button>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-400">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {showConfig && (
        <div className="mb-6 bg-gray-700 rounded-lg p-4 border border-gray-600">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center">
            <Key className="h-4 w-4 mr-2" />
            LLM Configuration
          </h3>
          <div className="space-y-3">
            <div className="text-xs text-green-400 mb-2">
              ✓ API Key detected from environment variables
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Provider</label>
              <select
                value={tempProvider}
                onChange={(e) => setTempProvider(e.target.value as any)}
                className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500"
              >
                <option value="openai">OpenAI GPT-4</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleConfigSave}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* System Status */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Mesh Agents</span>
          </div>
          <div className="text-lg font-bold text-white">{activeAgents.length}/{meshAgents.length}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Shield className="h-4 w-4 text-red-400" />
            <span className="text-xs text-gray-400">Active Threats</span>
          </div>
          <div className="text-lg font-bold text-white">{threats.length}</div>
        </div>
      </div>
      
      {/* Auto-Remediation Status */}
      <div className="mb-4 bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Auto-Remediation</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${autoRemediationActive ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400">
              {autoRemediationActive ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      
      {/* LLM Status */}
      <div className="mb-4 bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">LLM Provider</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 capitalize">{llmProvider}</span>
            <div className={`w-2 h-2 rounded-full ${apiKeyConfigured ? 'bg-green-400' : 'bg-yellow-400'}`} />
          </div>
        </div>
        {!apiKeyConfigured && (
          <p className="text-xs text-yellow-400 mt-1">
            Configure API key for enhanced analysis
          </p>
        )}
      </div>
      
      {!isActive ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">AI Co-pilot is inactive</p>
          <p className="text-sm text-gray-500">Toggle in the top navigation to activate</p>
        </div>
      ) : isAnalyzing ? (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-blue-400 mx-auto mb-2 animate-pulse" />
          <p className="text-blue-400">Analyzing network anomaly...</p>
          <p className="text-sm text-gray-500">Processing telemetry from {endpointProfiles.length} endpoints</p>
        </div>
      ) : currentAnalysis ? (
        <div className="max-h-96 overflow-y-auto">
          {(() => {
            const sections = parseAnalysis(currentAnalysis);
            return (
              <>
                {sections['Root Cause:'] && renderAnalysisSection(
                  'Root Cause',
                  sections['Root Cause:'],
                  <MessageSquare className="h-4 w-4 text-red-400" />
                )}
                {sections['Business Impact:'] && renderAnalysisSection(
                  'Business Impact',
                  sections['Business Impact:'],
                  <MessageSquare className="h-4 w-4 text-yellow-400" />
                )}
                {sections['Suggested CLI Fix:'] && renderAnalysisSection(
                  'Suggested CLI Fix',
                  sections['Suggested CLI Fix:'],
                  <MessageSquare className="h-4 w-4 text-green-400" />
                )}
                {sections['Automated Remediation:'] && renderAnalysisSection(
                  'Automated Remediation',
                  sections['Automated Remediation:'],
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                )}
                {sections['Alert Message:'] && renderAnalysisSection(
                  'Alert Message',
                  sections['Alert Message:'],
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                )}
                {sections['Endpoint Analysis:'] && renderAnalysisSection(
                  'Endpoint Analysis',
                  sections['Endpoint Analysis:'],
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                )}
                {sections['Admin Notification (if applicable):'] && renderAnalysisSection(
                  'Admin Notification',
                  sections['Admin Notification (if applicable):'],
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">No analysis available</p>
          <p className="text-sm text-gray-500">Trigger an anomaly to see AI analysis</p>
        </div>
      )}
    </div>
  );
};

export default CopilotPanel;