import React from 'react';
import { Shield, Activity, Clock, AlertTriangle } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import { useAI } from '../contexts/AIContext';
import DefenSysLogo from '../assets/defensys.jpg';

const TopNavbar: React.FC = () => {
  const { networkState } = useNetwork();
  const { isActive, toggleAI } = useAI();
  
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* DefenSys Logo Image */}
          <img src={DefenSysLogo} alt="DefenSys Logo" className="h-8 w-8 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-white">DefenSys</h1>
            <p className="text-sm text-gray-400">Network Resilience System</p>
          </div>
        </div>
        {/* Tagline in the center */}
        <div className="flex-1 flex justify-center">
          <span className="text-base text-blue-200 font-semibold tracking-wide italic">
          🔥 Predict. Prevent. Protect.🔥
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">Health Score:</span>
            <span className={`font-bold ${getStatusColor(networkState.healthScore)}`}>
              {networkState.healthScore}%
            </span>
          </div>
          
          <button
            onClick={toggleAI}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>AI Co-pilot</span>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
          </button>
          
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;