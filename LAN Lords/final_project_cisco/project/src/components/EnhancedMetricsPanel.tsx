import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Cpu, HardDrive, Activity, Network, TrendingUp, TrendingDown } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';


const { networkState } = useNetwork();


interface MetricDataPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: number;
}

const EnhancedMetricsPanel: React.FC = () => {
  const { networkState } = useNetwork();
  const [historicalData, setHistoricalData] = useState<MetricDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu');

  // Initialize with some historical data
  useEffect(() => {
    const initialData: MetricDataPoint[] = [];
    const now = Date.now();
    
    for (let i = 19; i >= 0; i--) {
      const timestamp = now - (i * 2000);
      const time = new Date(timestamp);
      initialData.push({
        time: time.toLocaleTimeString(),
        cpu: Math.round(networkState.metrics.cpu + (Math.random() - 0.5) * 10),
        memory: Math.round(networkState.metrics.memory + (Math.random() - 0.5) * 8),
        disk: Math.round(networkState.metrics.disk + (Math.random() - 0.5) * 5),
        network: Math.round(networkState.metrics.network + (Math.random() - 0.5) * 15),
        timestamp
      });
    }
    
    setHistoricalData(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint: MetricDataPoint = {
        time: now.toLocaleTimeString(),
        cpu: Math.round(networkState.metrics.cpu * 100) / 100,
        memory: Math.round(networkState.metrics.memory * 100) / 100,
        disk: Math.round(networkState.metrics.disk * 100) / 100,
        network: Math.round(networkState.metrics.network * 100) / 100,
        timestamp: now.getTime()
      };

      setHistoricalData(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only last 50 data points (about 100 seconds of data)
        return updated.slice(-50);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [networkState.metrics]);

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'cpu': return '#3B82F6';
      case 'memory': return '#10B981';
      case 'disk': return '#F59E0B';
      case 'network': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'cpu': return <Cpu className="h-5 w-5" />;
      case 'memory': return <Activity className="h-5 w-5" />;
      case 'disk': return <HardDrive className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getCurrentValue = (metric: string) => {
    switch (metric) {
      case 'cpu': return Math.round(networkState.metrics.cpu * 100) / 100;
      case 'memory': return Math.round(networkState.metrics.memory * 100) / 100;
      case 'disk': return Math.round(networkState.metrics.disk * 100) / 100;
      case 'network': return Math.round(networkState.metrics.network * 100) / 100;
      default: return 0;
    }
  };

  const getTrend = (metric: string) => {
    if (historicalData.length < 2) return 0;
    const current = getCurrentValue(metric);
    const previous = historicalData[historicalData.length - 2]?.[metric as keyof MetricDataPoint] as number;
    return current - previous;
  };

  const MetricCard: React.FC<{
    title: string;
    metric: 'cpu' | 'memory' | 'disk' | 'network';
    value: number;
    unit?: string;
  }> = ({ title, metric, value, unit = '%' }) => {
    const trend = getTrend(metric);
    const isSelected = selectedMetric === metric;
    
    return (
      <div 
        className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-400 bg-gray-600' : 'hover:bg-gray-600'
        }`}
        onClick={() => setSelectedMetric(metric)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div style={{ color: getMetricColor(metric) }}>
              {getMetricIcon(metric)}
            </div>
            <span className="text-sm font-medium text-gray-300">{title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">{value}{unit}</span>
            {trend !== 0 && (
              <div className={`flex items-center ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-xs ml-1">{Math.abs(trend).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Mini chart */}
        <div className="h-12">
          {/* <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData.slice(-20)}>
              <Line 
                type="monotone" 
                dataKey={metric}
                stroke={getMetricColor(metric)}
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.8}
              />
            </LineChart>
          </ResponsiveContainer> */}

          <ResponsiveContainer width="100%" height={200}>
  <LineChart data={networkState.historicalData}>
    <Line type="monotone" dataKey="cpu" stroke="#3B82F6" />
    {/* ...other chart config... */}
  </LineChart>
</ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">System Metrics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Monitoring</span>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="CPU Usage"
          metric="cpu"
          value={networkState.metrics.cpu}
        />
        
        <MetricCard
          title="Memory Usage"
          metric="memory"
          value={networkState.metrics.memory}
        />
        
        <MetricCard
          title="Disk Usage"
          metric="disk"
          value={networkState.metrics.disk}
        />
        
        <MetricCard
          title="Network Usage"
          metric="network"
          value={networkState.metrics.network}
        />
      </div>
      
      {/* Large Chart */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white capitalize">
            {selectedMetric} Usage Over Time
          </h3>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getMetricColor(selectedMetric) }}
            />
            <span className="text-sm text-gray-400">
              Current: {getCurrentValue(selectedMetric)}%
            </span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
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
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={getMetricColor(selectedMetric)}
                fill={getMetricColor(selectedMetric)}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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

export default EnhancedMetricsPanel;