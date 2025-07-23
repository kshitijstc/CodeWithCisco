import React from 'react';
import { Monitor, Smartphone, Camera, Cpu, Wifi, Server, AlertTriangle, Shield } from 'lucide-react';
import { endpointProfiler } from '../services/endpointProfiler';
import { meshAgentService } from '../services/meshAgentService';

const EndpointProfilesPanel: React.FC = () => {
  const [profiles, setProfiles] = React.useState(endpointProfiler.getAllProfiles());
  const [meshAgents, setMeshAgents] = React.useState(meshAgentService.getAllAgents());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProfiles(endpointProfiler.getAllProfiles());
      setMeshAgents(meshAgentService.getAllAgents());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getEndpointIcon = (type: string) => {
    switch (type) {
      case 'workstation': return <Monitor className="h-5 w-5" />;
      case 'laptop': return <Monitor className="h-5 w-5" />;
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'iot': return <Wifi className="h-5 w-5" />;
      case 'sensor': return <Cpu className="h-5 w-5" />;
      case 'server': return <Server className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workstation': return 'text-blue-400 bg-blue-900/20';
      case 'laptop': return 'text-green-400 bg-green-900/20';
      case 'mobile': return 'text-purple-400 bg-purple-900/20';
      case 'camera': return 'text-yellow-400 bg-yellow-900/20';
      case 'iot': return 'text-orange-400 bg-orange-900/20';
      case 'sensor': return 'text-cyan-400 bg-cyan-900/20';
      case 'server': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 7) return 'text-red-400';
    if (riskScore >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getAgentForEndpoint = (endpointId: string) => {
    return meshAgents.find(agent => agent.endpointId === endpointId);
  };

  // Initialize mock profiles if none exist
  React.useEffect(() => {
    if (profiles.length === 0) {
      const mockProfiles = endpointProfiler.generateMockProfiles();
      setProfiles(mockProfiles);
    }
  }, [profiles.length]);

  const highRiskEndpoints = profiles.filter(p => p.riskScore >= 7);
  const endpointsByType = profiles.reduce((acc, profile) => {
    acc[profile.type] = (acc[profile.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Endpoint Profiles</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Profiling</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{profiles.length}</div>
          <div className="text-sm text-gray-400">Total Endpoints</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{highRiskEndpoints.length}</div>
          <div className="text-sm text-gray-400">High Risk</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {meshAgents.filter(a => a.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">Active Agents</div>
        </div>
      </div>

      {/* Endpoint Type Distribution */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Endpoint Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(endpointsByType).map(([type, count]) => (
            <div key={type} className={`flex items-center justify-between p-2 rounded ${getTypeColor(type)}`}>
              <div className="flex items-center space-x-2">
                {getEndpointIcon(type)}
                <span className="text-sm capitalize">{type}</span>
              </div>
              <span className="text-sm font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {profiles.map((profile) => {
          const agent = getAgentForEndpoint(profile.id);
          return (
            <div
              key={profile.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getTypeColor(profile.type)}`}>
                    {getEndpointIcon(profile.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{profile.id}</h4>
                    <p className="text-xs text-gray-400 capitalize">{profile.type} • {profile.os}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${getRiskColor(profile.riskScore)}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-bold">{profile.riskScore}/10</span>
                  </div>
                  {agent && (
                    <div className="flex items-center space-x-1">
                      <Shield className={`h-4 w-4 ${agent.status === 'active' ? 'text-green-400' : 'text-red-400'}`} />
                      <span className="text-xs text-gray-400">Agent</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Hardware:</span>
                  <p className="text-white truncate">{profile.hardware}</p>
                </div>
                <div>
                  <span className="text-gray-400">Protocols:</span>
                  <p className="text-white">{profile.protocols.join(', ')}</p>
                </div>
              </div>

              {profile.dhcpClassId && (
                <div className="mt-2 text-xs">
                  <span className="text-gray-400">DHCP Class:</span>
                  <span className="text-white ml-1">{profile.dhcpClassId}</span>
                </div>
              )}

              {agent && (
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-600 rounded p-2 text-center">
                    <div className="text-blue-400 font-bold">{agent.localMetrics.cpu}%</div>
                    <div className="text-gray-400">CPU</div>
                  </div>
                  <div className="bg-gray-600 rounded p-2 text-center">
                    <div className="text-green-400 font-bold">{agent.localMetrics.memory}%</div>
                    <div className="text-gray-400">MEM</div>
                  </div>
                  <div className="bg-gray-600 rounded p-2 text-center">
                    <div className="text-yellow-400 font-bold">{agent.localMetrics.networkLatency}ms</div>
                    <div className="text-gray-400">LAT</div>
                  </div>
                  <div className="bg-gray-600 rounded p-2 text-center">
                    <div className="text-purple-400 font-bold">{agent.localMetrics.activeConnections}</div>
                    <div className="text-gray-400">CONN</div>
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-400">
                Last seen: {profile.lastSeen.toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EndpointProfilesPanel;