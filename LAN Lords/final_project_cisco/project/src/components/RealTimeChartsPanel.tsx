import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Activity, Network, TrendingUp, TrendingDown } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';

interface MetricDataPoint {
  time: string;
  value: number;
  timestamp: number;
}

const RealTimeChartsPanel: React.FC = () => {
  const { networkState } = useNetwork();
  const [cpuData, setCpuData] = useState<MetricDataPoint[]>([]);
  const [memoryData, setMemoryData] = useState<MetricDataPoint[]>([]);
  const [diskData, setDiskData] = useState<MetricDataPoint[]>([]);
  const [networkData, setNetworkData] = useState<MetricDataPoint[]>([]);

  // Initialize historical data
  useEffect(() => {
    const initializeData = (baseValue: number, variance: number = 10): MetricDataPoint[] => {
      const data: MetricDataPoint[] = [];
      const now = Date.now();
      
      for (let i = 29; i >= 0; i--) {
        const timestamp = now - (i * 2000);
        const time = new Date(timestamp);
        data.push({
          time: time.toLocaleTimeString(),
          value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
          timestamp
        });
      }
      return data;
    };

    setCpuData(initializeData(networkState.metrics.cpu, 15));
    setMemoryData(initializeData(networkState.metrics.memory, 12));
    setDiskData(initializeData(networkState.metrics.disk, 8));
    setNetworkData(initializeData(networkState.metrics.network, 20));
  }, []);

  // Update data in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      const timestamp = now.getTime();

      const updateData = (
        setData: React.Dispatch<React.SetStateAction<MetricDataPoint[]>>,
        currentValue: number
      ) => {
        setData(prev => {
          const newData = [...prev, {
            time: timeString,
            value: Math.round(currentValue * 100) / 100,
            timestamp
          }];
          return newData.slice(-30); // Keep last 30 points (1 minute of data)
        });
      };

      updateData(setCpuData, networkState.metrics.cpu);
      updateData(setMemoryData, networkState.metrics.memory);
      updateData(setDiskData, networkState.metrics.disk);
      updateData(setNetworkData, networkState.metrics.network);
    }, 2000);

    return () => clearInterval(interval);
  }, [networkState.metrics]);

  const getTrend = (data: MetricDataPoint[]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    return current - previous;
  };

  const ChartCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    data: MetricDataPoint[];
    color: string;
    currentValue: number;
  }> = ({ title, icon, data, color, currentValue }) => {
    const trend = getTrend(data);
    
    return (
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div style={{ color: color }}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">
                  {Math.round(currentValue * 100) / 100}%
                </span>
                {trend !== 0 && (
                  <div className={`flex items-center ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-sm ml-1">{Math.abs(Math.round(trend * 100) / 100)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Live</div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-1" />
          </div>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => [`${Math.round(value * 100) / 100}%`, title]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.9}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between text-sm text-gray-400">
          <span>Min: {Math.round(Math.min(...data.map(d => d.value)) * 100) / 100}%</span>
          <span>Max: {Math.round(Math.max(...data.map(d => d.value)) * 100) / 100}%</span>
          <span>Avg: {Math.round((data.reduce((sum, d) => sum + d.value, 0) / data.length) * 100) / 100}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Real-time System Metrics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Monitoring</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="CPU Usage"
          icon={<Cpu className="h-6 w-6" />}
          data={cpuData}
          color="#3B82F6"
          currentValue={networkState.metrics.cpu}
        />
        
        <ChartCard
          title="Memory Usage"
          icon={<Activity className="h-6 w-6" />}
          data={memoryData}
          color="#10B981"
          currentValue={networkState.metrics.memory}
        />
        
        <ChartCard
          title="Disk Usage"
          icon={<HardDrive className="h-6 w-6" />}
          data={diskData}
          color="#F59E0B"
          currentValue={networkState.metrics.disk}
        />
        
        <ChartCard
          title="Network Usage"
          icon={<Network className="h-6 w-6" />}
          data={networkData}
          color="#8B5CF6"
          currentValue={networkState.metrics.network}
        />
      </div>
      
      {/* Network Statistics */}
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

export default RealTimeChartsPanel;