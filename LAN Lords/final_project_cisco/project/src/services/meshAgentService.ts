interface MeshAgent {
  id: string;
  endpointId: string;
  status: 'active' | 'inactive' | 'error';
  lastHeartbeat: Date;
  capabilities: string[];
  localMetrics: {
    cpu: number;
    memory: number;
    disk: number;
    networkLatency: number;
    processCount: number;
    activeConnections: number;
  };
  peerConnections: string[];
  detectedThreats: ThreatDetection[];
}

interface ThreatDetection {
  id: string;
  type: 'rogue_agent' | 'malware' | 'suspicious_traffic' | 'resource_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  evidence: any;
}

interface RemediationAction {
  id: string;
  type: 'isolate' | 'reroute' | 'scale' | 'block' | 'quarantine';
  target: string;
  parameters: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
  result?: string;
}

class MeshAgentService {
  private agents: Map<string, MeshAgent> = new Map();
  private remediationQueue: RemediationAction[] = [];
  private isAutoRemediationEnabled: boolean = true;
  private activityMonitorUrl: string;

  constructor() {
    this.activityMonitorUrl = import.meta.env.VITE_ACTIVITY_MONITOR_URL || 'http://localhost:3001';
    this.initializeMockAgents();
    this.startHeartbeatMonitoring();
  }

  private initializeMockAgents() {
    const mockAgents: MeshAgent[] = [
      {
        id: 'agent-001',
        endpointId: 'endpoint-001',
        status: 'active',
        lastHeartbeat: new Date(),
        capabilities: ['monitoring', 'isolation', 'traffic_analysis'],
        localMetrics: {
          cpu: 45,
          memory: 62,
          disk: 34,
          networkLatency: 12,
          processCount: 156,
          activeConnections: 23
        },
        peerConnections: ['agent-002', 'agent-003'],
        detectedThreats: []
      },
      {
        id: 'agent-002',
        endpointId: 'endpoint-002',
        status: 'active',
        lastHeartbeat: new Date(),
        capabilities: ['monitoring', 'resource_management'],
        localMetrics: {
          cpu: 23,
          memory: 41,
          disk: 67,
          networkLatency: 8,
          processCount: 89,
          activeConnections: 12
        },
        peerConnections: ['agent-001', 'agent-004'],
        detectedThreats: []
      },
      {
        id: 'agent-003',
        endpointId: 'endpoint-003',
        status: 'active',
        lastHeartbeat: new Date(),
        capabilities: ['monitoring', 'video_analysis'],
        localMetrics: {
          cpu: 67,
          memory: 78,
          disk: 23,
          networkLatency: 15,
          processCount: 45,
          activeConnections: 8
        },
        peerConnections: ['agent-001'],
        detectedThreats: []
      }
    ];

    mockAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  private startHeartbeatMonitoring() {
    setInterval(() => {
      this.updateAgentMetrics();
      this.detectThreats();
      this.processRemediationQueue();
      this.syncWithActivityMonitor();
    }, 2000);
  }

  private updateAgentMetrics() {
    this.agents.forEach(agent => {
      // Simulate metric updates
      agent.localMetrics.cpu = Math.max(0, Math.min(100, 
        agent.localMetrics.cpu + (Math.random() - 0.5) * 10));
      agent.localMetrics.memory = Math.max(0, Math.min(100, 
        agent.localMetrics.memory + (Math.random() - 0.5) * 8));
      agent.localMetrics.networkLatency = Math.max(1, 
        agent.localMetrics.networkLatency + (Math.random() - 0.5) * 5);
      agent.localMetrics.activeConnections = Math.max(0, 
        agent.localMetrics.activeConnections + Math.floor((Math.random() - 0.5) * 6));
      
      agent.lastHeartbeat = new Date();
    });
  }

  private detectThreats() {
    this.agents.forEach(agent => {
      // Simulate threat detection
      if (Math.random() < 0.01) { // 1% chance per cycle
        const threat: ThreatDetection = {
          id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: ['rogue_agent', 'malware', 'suspicious_traffic', 'resource_abuse'][Math.floor(Math.random() * 4)] as ThreatDetection['type'],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as ThreatDetection['severity'],
          description: 'Automated threat detection by mesh agent',
          timestamp: new Date(),
          evidence: {
            agentId: agent.id,
            metrics: { ...agent.localMetrics },
            suspiciousActivity: 'Anomalous network behavior detected'
          }
        };

        agent.detectedThreats.push(threat);
        
        if (this.isAutoRemediationEnabled) {
          this.triggerAutomatedRemediation(threat, agent);
        }
      }
    });
  }

  private triggerAutomatedRemediation(threat: ThreatDetection, agent: MeshAgent) {
    let action: RemediationAction;

    switch (threat.type) {
      case 'rogue_agent':
        action = {
          id: `remediation-${Date.now()}`,
          type: 'isolate',
          target: agent.endpointId,
          parameters: { reason: 'Rogue agent detected', duration: 3600 },
          status: 'pending',
          timestamp: new Date()
        };
        break;

      case 'suspicious_traffic':
        action = {
          id: `remediation-${Date.now()}`,
          type: 'reroute',
          target: agent.endpointId,
          parameters: { 
            newPath: 'backup-route-1', 
            trafficType: 'all',
            reason: 'Suspicious traffic pattern'
          },
          status: 'pending',
          timestamp: new Date()
        };
        break;

      case 'resource_abuse':
        action = {
          id: `remediation-${Date.now()}`,
          type: 'scale',
          target: agent.endpointId,
          parameters: { 
            action: 'throttle',
            cpuLimit: 50,
            memoryLimit: 70,
            reason: 'Resource abuse detected'
          },
          status: 'pending',
          timestamp: new Date()
        };
        break;

      default:
        action = {
          id: `remediation-${Date.now()}`,
          type: 'quarantine',
          target: agent.endpointId,
          parameters: { reason: 'Unknown threat type', duration: 1800 },
          status: 'pending',
          timestamp: new Date()
        };
    }

    this.remediationQueue.push(action);
  }

  private processRemediationQueue() {
    const pendingActions = this.remediationQueue.filter(action => action.status === 'pending');
    
    pendingActions.forEach(action => {
      action.status = 'executing';
      
      // Simulate remediation execution
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          action.status = 'completed';
          action.result = `Successfully executed ${action.type} on ${action.target}`;
          
          // Apply the remediation effect
          this.applyRemediationEffect(action);
        } else {
          action.status = 'failed';
          action.result = `Failed to execute ${action.type} on ${action.target}`;
        }
      }, 1000 + Math.random() * 2000); // 1-3 second execution time
    });
  }

  private applyRemediationEffect(action: RemediationAction) {
    const agent = Array.from(this.agents.values()).find(a => a.endpointId === action.target);
    if (!agent) return;

    switch (action.type) {
      case 'isolate':
        agent.status = 'inactive';
        agent.peerConnections = [];
        break;

      case 'reroute':
        // Simulate traffic rerouting by adjusting network latency
        agent.localMetrics.networkLatency *= 1.2;
        break;

      case 'scale':
        // Apply resource limits
        if (action.parameters.cpuLimit) {
          agent.localMetrics.cpu = Math.min(agent.localMetrics.cpu, action.parameters.cpuLimit);
        }
        if (action.parameters.memoryLimit) {
          agent.localMetrics.memory = Math.min(agent.localMetrics.memory, action.parameters.memoryLimit);
        }
        break;

      case 'quarantine':
        agent.status = 'error';
        agent.localMetrics.activeConnections = 0;
        break;
    }
  }

  private async syncWithActivityMonitor() {
    try {
      const agentData = Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        endpointId: agent.endpointId,
        status: agent.status,
        metrics: agent.localMetrics,
        threats: agent.detectedThreats.length,
        lastHeartbeat: agent.lastHeartbeat.toISOString()
      }));

      // Send data to activity monitor (if available)
      if (this.activityMonitorUrl) {
        await fetch(`${this.activityMonitorUrl}/api/mesh-agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agents: agentData, timestamp: new Date().toISOString() })
        }).catch(() => {
          // Silently fail if activity monitor is not available
        });
      }
    } catch (error) {
      console.warn('Failed to sync with activity monitor:', error);
    }
  }

  // Public API methods
  getAllAgents(): MeshAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): MeshAgent | undefined {
    return this.agents.get(id);
  }

  getActiveAgents(): MeshAgent[] {
    return this.getAllAgents().filter(agent => agent.status === 'active');
  }

  getAgentsByEndpoint(endpointId: string): MeshAgent[] {
    return this.getAllAgents().filter(agent => agent.endpointId === endpointId);
  }

  getAllThreats(): ThreatDetection[] {
    const threats: ThreatDetection[] = [];
    this.agents.forEach(agent => {
      threats.push(...agent.detectedThreats);
    });
    return threats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getRemediationHistory(): RemediationAction[] {
    return [...this.remediationQueue].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  toggleAutoRemediation(): boolean {
    this.isAutoRemediationEnabled = !this.isAutoRemediationEnabled;
    return this.isAutoRemediationEnabled;
  }

  isAutoRemediationActive(): boolean {
    return this.isAutoRemediationEnabled;
  }

  manualRemediation(type: RemediationAction['type'], target: string, parameters: any): string {
    const action: RemediationAction = {
      id: `manual-${Date.now()}`,
      type,
      target,
      parameters: { ...parameters, manual: true },
      status: 'pending',
      timestamp: new Date()
    };

    this.remediationQueue.push(action);
    return action.id;
  }

  getNetworkTopology(): any {
    const nodes = this.getAllAgents().map(agent => ({
      id: agent.id,
      endpointId: agent.endpointId,
      status: agent.status,
      metrics: agent.localMetrics
    }));

    const edges: any[] = [];
    this.agents.forEach(agent => {
      agent.peerConnections.forEach(peerId => {
        edges.push({
          source: agent.id,
          target: peerId,
          type: 'peer_connection'
        });
      });
    });

    return { nodes, edges };
  }
}

export const meshAgentService = new MeshAgentService();
export type { MeshAgent, ThreatDetection, RemediationAction };