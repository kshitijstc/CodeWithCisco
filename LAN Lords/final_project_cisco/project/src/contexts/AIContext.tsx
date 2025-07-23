import React, { createContext, useContext, useState } from 'react';
import { llmService, EndpointProfile } from '../services/llmService';
import { endpointProfiler } from '../services/endpointProfiler';
import { meshAgentService } from '../services/meshAgentService';

interface AIContextType {
  isActive: boolean;
  isAnalyzing: boolean;
  currentAnalysis: string | null;
  llmProvider: 'openai' | 'anthropic' | 'gemini';
  apiKeyConfigured: boolean;
  toggleAI: () => void;
  analyzeAnomaly: (anomalyData: any) => Promise<void>;
  configureLLM: (provider: 'openai' | 'anthropic' | 'gemini', apiKey: string) => void;
  getEndpointProfiles: () => EndpointProfile[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true); // Auto-detect from env

  // Check for API keys on initialization
  React.useEffect(() => {
    const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
    const hasAnthropic = !!import.meta.env.VITE_ANTHROPIC_API_KEY;
    const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
    
    setApiKeyConfigured(hasOpenAI || hasAnthropic || hasGemini);
    
    // Set default provider based on available keys
    if (hasOpenAI) setLlmProvider('openai');
    else if (hasAnthropic) setLlmProvider('anthropic');
    else if (hasGemini) setLlmProvider('gemini');
  }, []);

  const toggleAI = () => {
    setIsActive(!isActive);
  };

  const configureLLM = (provider: 'openai' | 'anthropic' | 'gemini', apiKey: string) => {
    llmService.setProvider(provider, apiKey);
    setLlmProvider(provider);
    setApiKeyConfigured(!!apiKey);
  };

  const getEndpointProfiles = (): EndpointProfile[] => {
    return endpointProfiler.getAllProfiles();
  };

  const analyzeAnomaly = async (anomalyData: any) => {
    if (!isActive) return;

    setIsAnalyzing(true);
    
    try {
      // Get current endpoint profiles and network context
      const endpointProfiles = endpointProfiler.getAllProfiles();
      const meshAgents = meshAgentService.getAllAgents();
      const networkContext = {
        activeAgents: meshAgents.length,
        threats: meshAgentService.getAllThreats(),
        remediationHistory: meshAgentService.getRemediationHistory(),
        autoRemediationEnabled: meshAgentService.isAutoRemediationActive()
      };

      // Call LLM service for analysis
      const analysis = await llmService.analyzeAnomaly({
        telemetryData: anomalyData,
        endpointProfiles,
        networkContext
      });

      setCurrentAnalysis(analysis);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setCurrentAnalysis('### 🔍 Analysis Error:\nFailed to analyze anomaly. Please check LLM configuration and try again.');
    }
    
    setIsAnalyzing(false);
  };

  const value = {
    isActive,
    isAnalyzing,
    currentAnalysis,
    llmProvider,
    apiKeyConfigured,
    toggleAI,
    analyzeAnomaly,
    configureLLM,
    getEndpointProfiles
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};