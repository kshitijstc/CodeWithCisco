import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';

const HeroPanel: React.FC = () => {
  const { networkState } = useNetwork();

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-400" />;
    if (score >= 60) return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
    return <AlertTriangle className="h-8 w-8 text-red-400" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Network Health Overview</h2>
        <div className="flex items-center space-x-2">
          {getHealthIcon(networkState.healthScore)}
          <span className="text-lg font-bold text-white">{networkState.healthScore}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Active Nodes</h3>
          <p className="text-2xl font-bold text-white">{networkState.activeNodes}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-sm text-green-400">+2 today</span>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Threats Blocked</h3>
          <p className="text-2xl font-bold text-white">{networkState.threatsBlocked}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-red-400 mr-1" />
            <span className="text-sm text-red-400">+15 today</span>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Avg Latency</h3>
          <p className="text-2xl font-bold text-white">{networkState.avgLatency}ms</p>
          <div className="flex items-center mt-2">
            <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-sm text-green-400">-5ms today</span>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Anomaly Score</h3>
          <p className="text-2xl font-bold text-white">{networkState.anomalyScore}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm text-yellow-400">Elevated</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Network Health</span>
          <span className="text-sm text-gray-400">{networkState.healthScore}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getHealthColor(networkState.healthScore)}`}
            style={{ width: `${networkState.healthScore}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-green-400">
            {networkState.devices.filter(d => d.status === 'online').length}
          </div>
          <div className="text-sm text-gray-400">Online</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-yellow-400">
            {networkState.devices.filter(d => d.status === 'warning').length}
          </div>
          <div className="text-sm text-gray-400">Warning</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-red-400">
            {networkState.devices.filter(d => d.status === 'offline').length}
          </div>
          <div className="text-sm text-gray-400">Offline</div>
        </div>
      </div>
    </div>
  );
};

export default HeroPanel;