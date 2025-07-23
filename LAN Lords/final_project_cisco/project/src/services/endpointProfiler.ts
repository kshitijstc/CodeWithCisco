import { EndpointProfile } from './llmService';

interface NetworkProtocolData {
  dhcpClassId?: string;
  cdpInfo?: {
    deviceId: string;
    platform: string;
    capabilities: string[];
  };
  lldpInfo?: {
    systemName: string;
    systemDescription: string;
    portDescription: string;
  };
  httpUserAgent?: string;
  snmpData?: {
    sysDescr: string;
    sysObjectID: string;
    sysUpTime: number;
  };
}

interface RawEndpointData {
  id: string;
  ip: string;
  mac: string;
  protocols: NetworkProtocolData;
  trafficPattern: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connections: number;
  };
  lastSeen: Date;
}

class EndpointProfiler {
  private profiles: Map<string, EndpointProfile> = new Map();
  private classificationRules: Map<string, string> = new Map();

  constructor() {
    this.initializeClassificationRules();
  }

  private initializeClassificationRules() {
    // DHCP Class ID patterns
    this.classificationRules.set('MSFT 5.0', 'workstation');
    this.classificationRules.set('android-dhcp', 'mobile');
    this.classificationRules.set('iPhone', 'mobile');
    this.classificationRules.set('iPad', 'mobile');
    this.classificationRules.set('MacBook', 'laptop');
    this.classificationRules.set('ThinkPad', 'laptop');
    this.classificationRules.set('Dell Inc.', 'workstation');
    this.classificationRules.set('Raspberry Pi', 'iot');
    this.classificationRules.set('Arduino', 'iot');
    this.classificationRules.set('ESP32', 'iot');
    this.classificationRules.set('Axis', 'camera');
    this.classificationRules.set('Hikvision', 'camera');
    this.classificationRules.set('Dahua', 'camera');
    this.classificationRules.set('Honeywell', 'sensor');
    this.classificationRules.set('Siemens', 'sensor');
  }

  analyzeEndpoint(rawData: RawEndpointData): EndpointProfile {
    const existingProfile = this.profiles.get(rawData.id);
    
    const profile: EndpointProfile = {
      id: rawData.id,
      type: this.classifyEndpointType(rawData),
      os: this.detectOperatingSystem(rawData),
      hardware: this.detectHardware(rawData),
      protocols: this.extractProtocols(rawData),
      dhcpClassId: rawData.protocols.dhcpClassId,
      userAgent: rawData.protocols.httpUserAgent,
      snmpData: rawData.protocols.snmpData,
      cdpInfo: rawData.protocols.cdpInfo,
      lldpInfo: rawData.protocols.lldpInfo,
      riskScore: this.calculateRiskScore(rawData, existingProfile),
      lastSeen: rawData.lastSeen
    };

    this.profiles.set(rawData.id, profile);
    return profile;
  }

  private classifyEndpointType(data: RawEndpointData): EndpointProfile['type'] {
    const { protocols, trafficPattern } = data;

    // Check DHCP Class ID first
    if (protocols.dhcpClassId) {
      for (const [pattern, type] of this.classificationRules) {
        if (protocols.dhcpClassId.includes(pattern)) {
          return type as EndpointProfile['type'];
        }
      }
    }

    // Check HTTP User Agent
    if (protocols.httpUserAgent) {
      const ua = protocols.httpUserAgent.toLowerCase();
      if (ua.includes('android') || ua.includes('iphone') || ua.includes('mobile')) {
        return 'mobile';
      }
      if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
        return 'workstation';
      }
    }

    // Check SNMP data
    if (protocols.snmpData) {
      const sysDescr = protocols.snmpData.sysDescr.toLowerCase();
      if (sysDescr.includes('camera') || sysDescr.includes('video')) return 'camera';
      if (sysDescr.includes('sensor') || sysDescr.includes('temperature')) return 'sensor';
      if (sysDescr.includes('server') || sysDescr.includes('linux')) return 'server';
    }

    // Check CDP/LLDP info
    if (protocols.cdpInfo) {
      const platform = protocols.cdpInfo.platform.toLowerCase();
      if (platform.includes('switch') || platform.includes('router')) return 'server';
      if (platform.includes('phone') || platform.includes('mobile')) return 'mobile';
    }

    // Traffic pattern analysis
    if (trafficPattern.connections > 100 && trafficPattern.bytesOut > trafficPattern.bytesIn * 2) {
      return 'server';
    }
    if (trafficPattern.connections < 10 && trafficPattern.bytesIn < 1000000) {
      return 'iot';
    }

    // Default classification
    return 'workstation';
  }

  private detectOperatingSystem(data: RawEndpointData): string {
    const { protocols } = data;

    if (protocols.dhcpClassId) {
      if (protocols.dhcpClassId.includes('MSFT')) return 'Windows';
      if (protocols.dhcpClassId.includes('android')) return 'Android';
      if (protocols.dhcpClassId.includes('iPhone') || protocols.dhcpClassId.includes('iPad')) return 'iOS';
      if (protocols.dhcpClassId.includes('MacBook') || protocols.dhcpClassId.includes('Mac')) return 'macOS';
    }

    if (protocols.httpUserAgent) {
      const ua = protocols.httpUserAgent;
      if (ua.includes('Windows')) return 'Windows';
      if (ua.includes('Macintosh')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    }

    if (protocols.snmpData) {
      const sysDescr = protocols.snmpData.sysDescr;
      if (sysDescr.includes('Linux')) return 'Linux';
      if (sysDescr.includes('Windows')) return 'Windows';
      if (sysDescr.includes('FreeBSD')) return 'FreeBSD';
      if (sysDescr.includes('Cisco')) return 'Cisco IOS';
    }

    return 'Unknown';
  }

  private detectHardware(data: RawEndpointData): string {
    const { protocols } = data;

    if (protocols.dhcpClassId) {
      if (protocols.dhcpClassId.includes('Dell')) return 'Dell Computer';
      if (protocols.dhcpClassId.includes('HP')) return 'HP Computer';
      if (protocols.dhcpClassId.includes('Lenovo') || protocols.dhcpClassId.includes('ThinkPad')) return 'Lenovo Computer';
      if (protocols.dhcpClassId.includes('Apple') || protocols.dhcpClassId.includes('MacBook')) return 'Apple Computer';
      if (protocols.dhcpClassId.includes('Raspberry Pi')) return 'Raspberry Pi';
      if (protocols.dhcpClassId.includes('Arduino')) return 'Arduino Board';
    }

    if (protocols.cdpInfo) {
      return protocols.cdpInfo.platform;
    }

    if (protocols.lldpInfo) {
      return protocols.lldpInfo.systemDescription;
    }

    // MAC address OUI lookup (simplified)
    const mac = data.mac.toUpperCase();
    if (mac.startsWith('00:50:56')) return 'VMware Virtual Machine';
    if (mac.startsWith('08:00:27')) return 'VirtualBox Virtual Machine';
    if (mac.startsWith('00:1B:21')) return 'Dell Computer';
    if (mac.startsWith('00:23:24')) return 'Apple Computer';
    if (mac.startsWith('B8:27:EB')) return 'Raspberry Pi';

    return 'Generic Hardware';
  }

  private extractProtocols(data: RawEndpointData): string[] {
    const protocols: string[] = [];

    if (data.protocols.dhcpClassId) protocols.push('DHCP');
    if (data.protocols.cdpInfo) protocols.push('CDP');
    if (data.protocols.lldpInfo) protocols.push('LLDP');
    if (data.protocols.httpUserAgent) protocols.push('HTTP');
    if (data.protocols.snmpData) protocols.push('SNMP');

    // Add more protocol detection based on traffic patterns
    if (data.trafficPattern.connections > 0) {
      protocols.push('TCP');
    }

    return protocols;
  }

  private calculateRiskScore(data: RawEndpointData, existingProfile?: EndpointProfile): number {
    let riskScore = 0;

    // Base risk by endpoint type
    const typeRisk = {
      'iot': 3,
      'camera': 2,
      'sensor': 2,
      'mobile': 4,
      'workstation': 1,
      'laptop': 2,
      'server': 1
    };

    const endpointType = this.classifyEndpointType(data);
    riskScore += typeRisk[endpointType] || 3;

    // Unknown OS increases risk
    const os = this.detectOperatingSystem(data);
    if (os === 'Unknown') riskScore += 2;

    // High connection count increases risk
    if (data.trafficPattern.connections > 50) riskScore += 1;
    if (data.trafficPattern.connections > 100) riskScore += 2;

    // Unusual traffic patterns
    const bytesRatio = data.trafficPattern.bytesOut / (data.trafficPattern.bytesIn || 1);
    if (bytesRatio > 10 || bytesRatio < 0.1) riskScore += 1;

    // New device (no existing profile)
    if (!existingProfile) riskScore += 1;

    // Time since last seen
    const hoursSinceLastSeen = (Date.now() - data.lastSeen.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen > 24) riskScore += 1;

    // Missing expected protocols
    if (!data.protocols.dhcpClassId && !data.protocols.snmpData) riskScore += 1;

    return Math.min(10, Math.max(0, riskScore));
  }

  getAllProfiles(): EndpointProfile[] {
    return Array.from(this.profiles.values());
  }

  getProfile(id: string): EndpointProfile | undefined {
    return this.profiles.get(id);
  }

  getHighRiskEndpoints(): EndpointProfile[] {
    return this.getAllProfiles().filter(profile => profile.riskScore >= 7);
  }

  getEndpointsByType(type: EndpointProfile['type']): EndpointProfile[] {
    return this.getAllProfiles().filter(profile => profile.type === type);
  }

  generateMockProfiles(): EndpointProfile[] {
    const mockData: RawEndpointData[] = [
      {
        id: 'endpoint-001',
        ip: '10.0.1.100',
        mac: '00:1B:21:3A:4B:5C',
        protocols: {
          dhcpClassId: 'MSFT 5.0',
          httpUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          snmpData: {
            sysDescr: 'Windows 10 Enterprise',
            sysObjectID: '1.3.6.1.4.1.311',
            sysUpTime: 86400
          }
        },
        trafficPattern: {
          bytesIn: 1500000,
          bytesOut: 800000,
          packetsIn: 2000,
          packetsOut: 1500,
          connections: 25
        },
        lastSeen: new Date()
      },
      {
        id: 'endpoint-002',
        ip: '10.0.1.101',
        mac: 'B8:27:EB:12:34:56',
        protocols: {
          dhcpClassId: 'Raspberry Pi',
          snmpData: {
            sysDescr: 'Linux raspberrypi 5.4.0',
            sysObjectID: '1.3.6.1.4.1.8072',
            sysUpTime: 172800
          }
        },
        trafficPattern: {
          bytesIn: 50000,
          bytesOut: 25000,
          packetsIn: 100,
          packetsOut: 80,
          connections: 3
        },
        lastSeen: new Date()
      },
      {
        id: 'endpoint-003',
        ip: '10.0.1.102',
        mac: '00:12:34:56:78:90',
        protocols: {
          dhcpClassId: 'Axis Camera',
          httpUserAgent: 'Axis-Linux/9.80.1',
          snmpData: {
            sysDescr: 'AXIS M3027-PVE Network Camera',
            sysObjectID: '1.3.6.1.4.1.368',
            sysUpTime: 259200
          }
        },
        trafficPattern: {
          bytesIn: 100000,
          bytesOut: 5000000,
          packetsIn: 200,
          packetsOut: 8000,
          connections: 5
        },
        lastSeen: new Date()
      }
    ];

    return mockData.map(data => this.analyzeEndpoint(data));
  }
}

export const endpointProfiler = new EndpointProfiler();
export type { RawEndpointData, NetworkProtocolData };