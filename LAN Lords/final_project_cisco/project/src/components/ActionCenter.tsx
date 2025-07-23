import React from 'react';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const ActionCenter: React.FC = () => {
  const { alerts } = useAlert();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Action Center</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Feed</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400">No active alerts</p>
            <p className="text-sm text-gray-500">Network is operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border border-gray-600 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white break-words">
                  {alert.message}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)} font-medium`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                {alert.type && (
                  <div className="mt-2">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                      Type: {alert.type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">
            {alerts.filter(a => a.severity === 'high').length}
          </div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {alerts.filter(a => a.severity === 'medium').length}
          </div>
          <div className="text-xs text-gray-400">Warning</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">
            {alerts.filter(a => a.severity === 'low').length}
          </div>
          <div className="text-xs text-gray-400">Info</div>
        </div>
      </div>
    </div>
  );
};

export default ActionCenter;