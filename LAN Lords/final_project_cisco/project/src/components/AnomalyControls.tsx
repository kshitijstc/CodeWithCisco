import React from 'react';
import { Zap, UserX, Settings, AlertTriangle } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import { useAlert } from '../contexts/AlertContext';
import { useAI } from '../contexts/AIContext';

const AnomalyControls: React.FC = () => {
  const { simulateAnomaly } = useNetwork();
  const { addAlert } = useAlert();
  const { analyzeAnomaly } = useAI();

  const handleAnomalySimulation = async (type: 'ddos' | 'rogue' | 'config') => {
    const anomalyData = simulateAnomaly(type);
    
    const alertMessages = {
      ddos: '🚨 DDoS Attack Detected - High traffic volume from multiple sources',
      rogue: '🔍 Rogue Agent Detected - Unauthorized device attempting network access',
      config: '⚙️ Configuration Drift Detected - Switch configuration mismatch'
    };

    addAlert({
      id: Date.now().toString(),
      type,
      message: alertMessages[type],
      timestamp: new Date(),
      severity: type === 'ddos' ? 'high' : type === 'rogue' ? 'medium' : 'low'
    });

    // Trigger AI analysis
    await analyzeAnomaly(anomalyData);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Anomaly Simulation</h2>
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => handleAnomalySimulation('ddos')}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Zap className="h-5 w-5" />
          <span>Inject DDoS Attack</span>
        </button>
        
        <button
          onClick={() => handleAnomalySimulation('rogue')}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <UserX className="h-5 w-5" />
          <span>Inject Rogue Agent</span>
        </button>
        
        <button
          onClick={() => handleAnomalySimulation('config')}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Inject Config Drift</span>
        </button>
      </div>
      
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Simulation Info</h3>
        <p className="text-xs text-gray-400">
          These buttons simulate network anomalies for testing and demonstration purposes. 
          Each simulation triggers real-time AI analysis and generates appropriate alerts.
        </p>
      </div>
    </div>
  );
};

export default AnomalyControls;