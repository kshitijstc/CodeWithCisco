import React from 'react';
import { Server, Wifi, Globe, AlertTriangle } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';

const TopologyMap: React.FC = () => {
  const { networkState } = useNetwork();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-6 w-6" />;
      case 'switch': return <Wifi className="h-6 w-6" />;
      case 'router': return <Globe className="h-6 w-6" />;
      default: return <Server className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-900/20 border-green-400';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400';
      case 'offline': return 'text-red-400 bg-red-900/20 border-red-400';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Network Topology</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Map</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {networkState.devices.map((device) => (
          <div
            key={device.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${getStatusColor(device.status)}`}
          >
            <div className="flex-shrink-0">
              {getDeviceIcon(device.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate">
                  {device.name}
                </p>
                {device.status === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">{device.ip}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">{device.type}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">
                  CPU: {device.cpu}%
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  MEM: {device.memory}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Legend</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-gray-400">Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-gray-400">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-gray-400">Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopologyMap;