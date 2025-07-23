import React from 'react';
import { Shield, Zap, RotateCcw, Ban, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { meshAgentService, RemediationAction } from '../services/meshAgentService';

const RemediationPanel: React.FC = () => {
  const [remediationHistory, setRemediationHistory] = React.useState<RemediationAction[]>([]);
  const [autoRemediationEnabled, setAutoRemediationEnabled] = React.useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemediationHistory(meshAgentService.getRemediationHistory());
      setAutoRemediationEnabled(meshAgentService.isAutoRemediationActive());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoRemediation = () => {
    const newState = meshAgentService.toggleAutoRemediation();
    setAutoRemediationEnabled(newState);
  };

  const handleManualRemediation = (type: RemediationAction['type']) => {
    if (!selectedEndpoint) return;
    
    const parameters = {
      reason: 'Manual intervention',
      timestamp: new Date().toISOString()
    };

    meshAgentService.manualRemediation(type, selectedEndpoint, parameters);
  };

  const getActionIcon = (type: RemediationAction['type']) => {
    switch (type) {
      case 'isolate': return <Ban className="h-4 w-4" />;
      case 'reroute': return <RotateCcw className="h-4 w-4" />;
      case 'scale': return <Zap className="h-4 w-4" />;
      case 'block': return <Shield className="h-4 w-4" />;
      case 'quarantine': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: RemediationAction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'executing': return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionColor = (type: RemediationAction['type']) => {
    switch (type) {
      case 'isolate': return 'text-red-400 bg-red-900/20';
      case 'reroute': return 'text-blue-400 bg-blue-900/20';
      case 'scale': return 'text-green-400 bg-green-900/20';
      case 'block': return 'text-orange-400 bg-orange-900/20';
      case 'quarantine': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const agents = meshAgentService.getAllAgents();
  const recentActions = remediationHistory.slice(0, 10);
  const completedActions = remediationHistory.filter(a => a.status === 'completed').length;
  const failedActions = remediationHistory.filter(a => a.status === 'failed').length;
  const pendingActions = remediationHistory.filter(a => a.status === 'pending' || a.status === 'executing').length;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Automated Remediation</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${autoRemediationEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm text-gray-400">
            {autoRemediationEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Auto-Remediation Toggle */}
      <div className="mb-6 bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Auto-Remediation System</h3>
            <p className="text-xs text-gray-400">Automatically respond to detected threats</p>
          </div>
          <button
            onClick={handleToggleAutoRemediation}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoRemediationEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {autoRemediationEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">{completedActions}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">{pendingActions}</div>
          <div className="text-xs text-gray-400">In Progress</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{failedActions}</div>
          <div className="text-xs text-gray-400">Failed</div>
        </div>
      </div>

      {/* Manual Remediation Controls */}
      <div className="mb-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Manual Remediation</h3>
        <div className="space-y-3">
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500"
          >
            <option value="">Select endpoint...</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.endpointId}>
                {agent.endpointId} ({agent.status})
              </option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleManualRemediation('isolate')}
              disabled={!selectedEndpoint}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Ban className="h-4 w-4" />
              <span>Isolate</span>
            </button>
            
            <button
              onClick={() => handleManualRemediation('reroute')}
              disabled={!selectedEndpoint}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reroute</span>
            </button>
            
            <button
              onClick={() => handleManualRemediation('scale')}
              disabled={!selectedEndpoint}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Zap className="h-4 w-4" />
              <span>Scale</span>
            </button>
            
            <button
              onClick={() => handleManualRemediation('quarantine')}
              disabled={!selectedEndpoint}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Quarantine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Remediation History */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Recent Actions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentActions.length === 0 ? (
            <div className="text-center py-4">
              <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No remediation actions yet</p>
            </div>
          ) : (
            recentActions.map((action) => (
              <div
                key={action.id}
                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${getActionColor(action.type)}`}>
                      {getActionIcon(action.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white capitalize">
                        {action.type} - {action.target}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {action.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(action.status)}
                    <span className="text-xs text-gray-400 capitalize">{action.status}</span>
                  </div>
                </div>
                
                {action.parameters?.reason && (
                  <p className="text-xs text-gray-300 mb-2">
                    Reason: {action.parameters.reason}
                  </p>
                )}
                
                {action.result && (
                  <p className={`text-xs ${action.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                    {action.result}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RemediationPanel;