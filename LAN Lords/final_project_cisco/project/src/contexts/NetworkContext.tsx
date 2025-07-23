import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Device {
  id: string;
  name: string;
  type: 'server' | 'switch' | 'router';
  status: 'online' | 'warning' | 'offline';
  ip: string;
  cpu: number;
  memory: number;
}

interface MetricDataPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: number;
}
interface NetworkMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  packetsIn: number;
  packetsOut: number;
}

interface NetworkState {
  healthScore: number;
  activeNodes: number;
  threatsBlocked: number;
  avgLatency: number;
  anomalyScore: number;
  metrics: NetworkMetrics;
  devices: Device[];
  historicalData: MetricDataPoint[];
}

interface NetworkContextType {
  networkState: NetworkState;
  updateMetrics: () => void;
  simulateAnomaly: (type: 'ddos' | 'rogue' | 'config') => any;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    healthScore: 85,
    activeNodes: 24,
    threatsBlocked: 127,
    avgLatency: 23,
    anomalyScore: 2.3,
    metrics: {
      cpu: 45,
      memory: 62,
      disk: 34,
      network: 71,
      packetsIn: 1_250_000,
      packetsOut: 1_100_000
    },
    devices: [
      {
        id: '1',
        name: 'core-switch-1',
        type: 'switch',
        status: 'online',
        ip: '10.0.1.1',
        cpu: 23,
        memory: 45
      },
      {
        id: '2',
        name: 'core-switch-2',
        type: 'switch',
        status: 'online',
        ip: '10.0.1.2',
        cpu: 31,
        memory: 52
      },
      {
        id: '3',
        name: 'edge-router-1',
        type: 'router',
        status: 'warning',
        ip: '10.0.2.1',
        cpu: 67,
        memory: 78
      },
      {
        id: '4',
        name: 'server-cluster-1',
        type: 'server',
        status: 'online',
        ip: '10.0.3.1',
        cpu: 42,
        memory: 68
      },
      {
        id: '5',
        name: 'server-cluster-2',
        type: 'server',
        status: 'online',
        ip: '10.0.3.2',
        cpu: 38,
        memory: 59
      }
    ],
    historicalData: []
  });

  // const updateMetrics = useCallback(() => {
  //   setNetworkState(prev => ({
  //     ...prev,
  //     metrics: {
  //       ...prev.metrics,
  //       cpu: Math.max(0, Math.min(100, prev.metrics.cpu + (Math.random() - 0.5) * 10)),
  //       memory: Math.max(0, Math.min(100, prev.metrics.memory + (Math.random() - 0.5) * 8)),
  //       disk: Math.max(0, Math.min(100, prev.metrics.disk + (Math.random() - 0.5) * 5)),
  //       network: Math.max(0, Math.min(100, prev.metrics.network + (Math.random() - 0.5) * 15)),
  //       packetsIn: prev.metrics.packetsIn + Math.floor(Math.random() * 10000),
  //       packetsOut: prev.metrics.packetsOut + Math.floor(Math.random() * 8000)
  //     },
  //     devices: prev.devices.map(device => ({
  //       ...device,
  //       cpu: Math.max(0, Math.min(100, device.cpu + (Math.random() - 0.5) * 8)),
  //       memory: Math.max(0, Math.min(100, device.memory + (Math.random() - 0.5) * 6))
  //     }))
  //   }));
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const res = await fetch('http://localhost:5000/api/metrics');
  //     const data = await res.json();
  //     setNetworkState(prev => ({
  //       ...prev,
  //       metrics: {
  //         ...prev.metrics,
  //         ...data
  //       }
  //     }));
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('http://localhost:5000/api/metrics');
      const data = await res.json();
      const now = new Date();
      const newDataPoint = {
        time: now.toLocaleTimeString(),
        cpu: Math.round(data.cpu * 100) / 100,
        memory: Math.round(data.memory * 100) / 100,
        disk: Math.round(data.disk * 100) / 100,
        network: Math.round(data.network * 100) / 100,
        timestamp: now.getTime()
      };
      setNetworkState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          ...data
        },
        historicalData: [...(prev.historicalData || []), newDataPoint].slice(-50)
      }));
    }, 2000);
  
    return () => clearInterval(interval);
  }, []);

  const simulateAnomaly = useCallback((type: 'ddos' | 'rogue' | 'config') => {
    const timestamp = new Date().toISOString();
    
    switch (type) {
      case 'ddos':
        setNetworkState(prev => ({
          ...prev,
          healthScore: Math.max(20, prev.healthScore - 25),
          threatsBlocked: prev.threatsBlocked + 50,
          avgLatency: prev.avgLatency + 35,
          anomalyScore: prev.anomalyScore + 3.2,
          metrics: {
            ...prev.metrics,
            network: Math.min(95, prev.metrics.network + 35),
            cpu: Math.min(90, prev.metrics.cpu + 30),
            memory: Math.min(85, prev.metrics.memory + 20),
            packetsIn: prev.metrics.packetsIn + 500000
          }
        }));
        
        return {
          type: 'ddos',
          timestamp,
          source_ips: ['192.168.1.100', '203.0.113.42', '198.51.100.33'],
          target_ip: '10.0.1.1',
          packet_rate: 50000,
          severity: 'high',
          description: 'Distributed Denial of Service attack detected from multiple sources'
        };
        
      case 'rogue':
        setNetworkState(prev => ({
          ...prev,
          healthScore: Math.max(45, prev.healthScore - 18),
          anomalyScore: prev.anomalyScore + 2.1,
          metrics: {
            ...prev.metrics,
            cpu: Math.min(85, prev.metrics.cpu + 20),
            network: Math.min(80, prev.metrics.network + 25),
            memory: Math.min(75, prev.metrics.memory + 10)
          },
          devices: prev.devices.map(device => 
            device.id === '3' ? { ...device, status: 'warning' as const } : device
          )
        }));
        
        return {
          type: 'rogue_agent',
          timestamp,
          device_id: 'unknown-device-001',
          mac_address: '00:1B:44:11:3A:B7',
          ip_address: '10.0.1.99',
          port: 'switch-3:port-24',
          behavior: 'unauthorized_access_attempt',
          severity: 'medium',
          description: 'Unauthorized device attempting to join network'
        };
        
      case 'config':
        setNetworkState(prev => ({
          ...prev,
          healthScore: Math.max(65, prev.healthScore - 12),
          anomalyScore: prev.anomalyScore + 1.5,
          metrics: {
            ...prev.metrics,
            cpu: Math.min(75, prev.metrics.cpu + 15),
            memory: Math.min(70, prev.metrics.memory + 12),
            disk: Math.min(65, prev.metrics.disk + 8)
          },
          devices: prev.devices.map(device => 
            device.name === 'core-switch-1' ? { ...device, status: 'warning' as const } : device
          )
        }));
        
        return {
          type: 'config_drift',
          timestamp,
          device_name: 'core-switch-1',
          device_id: 'switch-001',
          config_hash_expected: 'abcd1234567890ef',
          config_hash_actual: 'zxy9876543210fed',
          drift_type: 'configuration_mismatch',
          severity: 'low',
          description: 'Configuration drift detected after failed SWIM deployment'
        };
        
      default:
        return null;
    }
  }, []);

  const value = {
    networkState,
    // updateMetrics,
    simulateAnomaly
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};