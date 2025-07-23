import React, { useState, useEffect } from 'react';
import { Monitor, Activity, Users, Shield, Network, BarChart3 } from 'lucide-react';
import TopNavbar from './TopNavbar';
import OverviewPage from './pages/OverviewPage';
import EndpointsPage from './pages/EndpointsPage';
import TopologyPage from './pages/TopologyPage';
import { useNetwork } from '../contexts/NetworkContext';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { updateMetrics } = useNetwork();

  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics();
    }, 2000);

    return () => clearInterval(interval);
  }, [updateMetrics]);

  const tabs = [
    {
      id: 'overview',
      name: 'Network Overview',
      icon: <Monitor className="h-5 w-5" />,
      description: 'Health metrics, anomaly simulation & AI analysis'
    },
    {
      id: 'endpoints',
      name: 'Endpoints & Security',
      icon: <Users className="h-5 w-5" />,
      description: 'Endpoint profiles, remediation & action center'
    },
    {
      id: 'topology',
      name: 'Network Topology',
      icon: <Network className="h-5 w-5" />,
      description: 'Live network map and device status'
    }
  ];

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'endpoints':
        return <EndpointsPage />;
      case 'topology':
        return <TopologyPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <TopNavbar />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <div className="text-left">
                  <div>{tab.name}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container mx-auto px-4 py-6">
        {renderPage()}
      </div>
    </div>
  );
};

export default Dashboard;