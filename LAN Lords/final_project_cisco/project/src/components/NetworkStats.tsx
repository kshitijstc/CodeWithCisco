import React from 'react';
import { Activity, Zap, Shield, AlertTriangle } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import { meshAgentService } from '../services/meshAgentService';

const NetworkStats: React.FC = () => {
  const { networkState } = useNetwork();
  const [meshAgents, setMeshAgents] = React.useState(meshAgentService.getAllAgents());
  const [threats, setThreats] = React.useState(meshAgentService.getAllThreats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMeshAgents(meshAgentService.getAllAgents());
      setThreats(meshAgentService.getAllThreats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activeAgents = meshAgents.filter(agent => agent.status === 'active');
  const criticalThreats = threats.filter(threat => threat.severity === 'critical' || threat.severity === 'high');
  const onlineDevices = networkState.devices.filter(d => d.status === 'online');
  const warningDevices = networkState.devices.filter(d => d.status === 'warning');

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Network Statistics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Real-time Stats</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Network Health */}
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Activity className="h-8 w-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            {networkState.healthScore}%
          </div>
          <div className="text-sm text-gray-400">Network Health</div>
          <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${networkState.healthScore}%` }}
            />
          </div>
        </div>

        {/* Active Mesh Agents */}
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Zap className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {activeAgents.length}
          </div>
          <div className="text-sm text-gray-400">Active Agents</div>
          <div className="text-xs text-gray-500 mt-1">
            {meshAgents.length} total agents
          </div>
        </div>

        {/* Security Threats */}
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">
            {criticalThreats.length}
          </div>
          <div className="text-sm text-gray-400">Critical Threats</div>
          <div className="text-xs text-gray-500 mt-1">
            {threats.length} total threats
          </div>
        </div>

        {/* Device Status */}
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {onlineDevices.length}
          </div>
          <div className="text-sm text-gray-400">Online Devices</div>
          <div className="text-xs text-gray-500 mt-1">
            {warningDevices.length} warnings
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Network Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Avg Latency</span>
              <span className="text-xs text-white">{networkState.avgLatency}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Packets In</span>
              <span className="text-xs text-white">{networkState.metrics.packetsIn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Packets Out</span>
              <span className="text-xs text-white">{networkState.metrics.packetsOut.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Security Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Threats Blocked</span>
              <span className="text-xs text-white">{networkState.threatsBlocked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Anomaly Score</span>
              <span className="text-xs text-white">{networkState.anomalyScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Auto Remediation</span>
              <span className={`text-xs ${meshAgentService.isAutoRemediationActive() ? 'text-green-400' : 'text-red-400'}`}>
                {meshAgentService.isAutoRemediationActive() ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Resource Usage</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">CPU Usage</span>
              <span className="text-xs text-white">{networkState.metrics.cpu}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Memory Usage</span>
              <span className="text-xs text-white">{networkState.metrics.memory}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Network Usage</span>
              <span className="text-xs text-white">{networkState.metrics.network}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;