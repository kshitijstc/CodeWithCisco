import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Activity, Network } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';

const MetricsPanel: React.FC = () => {
  const { networkState } = useNetwork();

  const generateTimeSeriesData = (baseValue: number, variance: number = 10) => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance))
    }));
  };

  const cpuData = generateTimeSeriesData(networkState.metrics.cpu, 15);
  const memoryData = generateTimeSeriesData(networkState.metrics.memory, 12);
  const diskData = generateTimeSeriesData(networkState.metrics.disk, 8);
  const networkData = generateTimeSeriesData(networkState.metrics.network, 20);

  const MetricCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    value: number;
    data: any[];
    color: string;
  }> = ({ title, icon, value, data, color }) => (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
        <span className={`text-lg font-bold ${color}`}>{value}%</span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color.replace('text-', '#')} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">System Metrics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="CPU Usage"
          icon={<Cpu className="h-4 w-4 text-blue-400" />}
          value={networkState.metrics.cpu}
          data={cpuData}
          color="text-blue-400"
        />
        
        <MetricCard
          title="Memory Usage"
          icon={<Activity className="h-4 w-4 text-green-400" />}
          value={networkState.metrics.memory}
          data={memoryData}
          color="text-green-400"
        />
        
        <MetricCard
          title="Disk Usage"
          icon={<HardDrive className="h-4 w-4 text-yellow-400" />}
          value={networkState.metrics.disk}
          data={diskData}
          color="text-yellow-400"
        />
        
        <MetricCard
          title="Network Usage"
          icon={<Network className="h-4 w-4 text-purple-400" />}
          value={networkState.metrics.network}
          data={networkData}
          color="text-purple-400"
        />
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {networkState.metrics.packetsIn.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Packets In</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {networkState.metrics.packetsOut.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Packets Out</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {networkState.avgLatency}ms
          </div>
          <div className="text-sm text-gray-400">Avg Latency</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;