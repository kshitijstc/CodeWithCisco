interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  model: string;
}

interface AnomalyAnalysisRequest {
  telemetryData: any;
  endpointProfiles: EndpointProfile[];
  networkContext: any;
}

interface EndpointProfile {
  id: string;
  type: 'iot' | 'camera' | 'sensor' | 'workstation' | 'laptop' | 'server' | 'mobile';
  os: string;
  hardware: string;
  protocols: string[];
  dhcpClassId?: string;
  userAgent?: string;
  snmpData?: any;
  cdpInfo?: any;
  lldpInfo?: any;
  riskScore: number;
  lastSeen: Date;
}

class LLMService {
  private config: LLMConfig;

  constructor() {
    this.config = {
      provider: 'openai',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4'
    };
    
    // Auto-detect available API keys and set provider
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.config.provider = 'openai';
      this.config.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    } else if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
      this.config.provider = 'anthropic';
      this.config.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      this.config.provider = 'gemini';
      this.config.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  }

  async analyzeAnomaly(request: AnomalyAnalysisRequest): Promise<string> {
    if (!this.config.apiKey) {
      return this.generateMockAnalysis(request.telemetryData);
    }

    const prompt = this.buildAegisPrompt(request);
    
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'anthropic':
          return await this.callAnthropic(prompt);
        case 'gemini':
          return await this.callGemini(prompt);
        default:
          return this.generateMockAnalysis(request.telemetryData);
      }
    } catch (error) {
      console.error('LLM API Error:', error);
      return this.generateMockAnalysis(request.telemetryData);
    }
  }

  private buildAegisPrompt(request: AnomalyAnalysisRequest): string {
    const { telemetryData, endpointProfiles, networkContext } = request;
    
    return `🛡️ Title: DefenSys – Cisco's Intelligent Network Resilience System

Welcome, Network Co-Pilot. You are an elite AI Network Analyst, trusted to defend and optimize enterprise-grade infrastructure under active threats.

You are now live in a high-stakes network environment. Based on the JSON telemetry from distributed agents, you must:

1. Detect and confirm anomalies or attack vectors.
2. Provide the most likely **Root Cause**.
3. Estimate the **Business or Operational Impact**.
4. Propose specific **CLI-level Remediation** commands.
5. Generate a concise, real-time **Alert Message**.
6. If critical, initiate a fallback action and recommend escalation (admin email).

---
📦 Input Telemetry:
\`\`\`json
${JSON.stringify(telemetryData, null, 2)}
\`\`\`

📊 Endpoint Profiles:
\`\`\`json
${JSON.stringify(endpointProfiles, null, 2)}
\`\`\`

🌐 Network Context:
\`\`\`json
${JSON.stringify(networkContext, null, 2)}
\`\`\`

🧠 SYSTEM CONTEXT:

This anomaly was injected or detected in real-time from the Cisco "DefenSys Console".
The network is monitored via active endpoint agents reporting:
- CPU, Memory, Disk, Latency, PacketIn/Out
- Endpoint fingerprinting: OS, workload type, hardware specs
- Traffic analyzed via passive sensors + behavioral ML
- Dashboard shows heatmaps, graphs, anomaly spikes, and live logs
- Anomaly toggles simulate: DDoS, Rogue Agent, Config Drift

⚙️ OUTPUT FORMAT (Markdown):

### 🔍 Root Cause:
Clearly explain what's going wrong. Reference endpoint names, device IDs, or flow anomalies.

### 📊 Endpoint Analysis:
Analyze the affected endpoints, their profiles, and risk factors.

### 📉 Business Impact:
What part of the enterprise could be disrupted?

### 🛠️ Suggested CLI Fix:
List 2–4 CLI-level commands Cisco engineers can run to fix the issue.

### 🤖 Automated Remediation:
Suggest automated actions the system can take immediately.

### 📢 Alert Message:
One short sentence for the alert system.

### 📨 Admin Notification (if applicable):
If critical, suggest escalation with anomaly ID + endpoint details.

Keep language confident and professional. Use only Cisco CLI commands. May the packets be with you.`;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private generateMockAnalysis(telemetryData: any): string {
    const analysisTemplates = {
      ddos: `### 🔍 Root Cause:
Distributed Denial of Service (DDoS) attack detected from multiple source IPs targeting core infrastructure. Traffic volume exceeded normal baseline by 500% with packet rate of ${telemetryData.packet_rate || '50,000'}/sec.

### 📊 Endpoint Analysis:
- **Primary Target**: ${telemetryData.target_ip || '10.0.1.1'} (Core Switch)
- **Attack Sources**: ${telemetryData.source_ips?.join(', ') || 'Multiple external IPs'}
- **Affected Endpoints**: 15 workstations, 8 IoT devices experiencing connectivity issues
- **Risk Assessment**: HIGH - Critical infrastructure under attack

### 📉 Business Impact:
Service degradation for all users accessing core network resources. Potential revenue loss due to application timeouts and failed transactions. Customer experience severely impacted with elevated response times.

### 🛠 Suggested CLI Fix:
\`\`\`bash
access-list 100 deny ip ${telemetryData.source_ips?.[0] || '192.168.1.100'} 0.0.0.0 any
rate-limit input 10000 conform-action transmit exceed-action drop
ip verify unicast source reachable-via rx
show ip access-lists
\`\`\`

### 🤖 Automated Remediation:
- Traffic rerouting through backup paths activated
- Rate limiting applied to suspicious sources
- DDoS protection services engaged automatically
- Affected endpoints isolated to prevent lateral spread

### 📢 Alert Message:
🚨 DDoS Attack Blocked - Traffic from ${telemetryData.source_ips?.length || 3} sources mitigated.

### 📬 Admin Notification (if applicable):
Critical DDoS attack detected and mitigated. Recommend immediate escalation to security team and activation of enhanced DDoS protection services.`,

      rogue_agent: `### 🔍 Root Cause:
Unauthorized device with MAC address ${telemetryData.mac_address || '00:1B:44:11:3A:B7'} attempting to join network via ${telemetryData.port || 'switch-3:port-24'}. Device fingerprinting shows non-standard behavior patterns inconsistent with approved endpoints.

### 📊 Endpoint Analysis:
- **Device Type**: Unknown/Unclassified
- **MAC Address**: ${telemetryData.mac_address || '00:1B:44:11:3A:B7'}
- **IP Attempt**: ${telemetryData.ip_address || '10.0.1.99'}
- **Port Location**: ${telemetryData.port || 'switch-3:port-24'}
- **Behavior Pattern**: Unauthorized access attempts, port scanning detected
- **Risk Score**: 8.5/10 - High threat potential

### 📉 Business Impact:
Potential security breach with unauthorized network access. Risk of data exfiltration, lateral movement, and compliance violations. Network integrity compromised.

### 🛠 Suggested CLI Fix:
\`\`\`bash
interface ${telemetryData.port || 'GigabitEthernet0/24'}
shutdown
switchport port-security violation shutdown
switchport port-security mac-address sticky
no shutdown
\`\`\`

### 🤖 Automated Remediation:
- Port automatically disabled and quarantined
- Device MAC address added to blacklist
- Network access control policies updated
- Security team notified for physical inspection

### 📢 Alert Message:
🔍 Rogue Device Blocked - Unauthorized access attempt from ${telemetryData.ip_address || '10.0.1.99'}.

### 📬 Admin Notification (if applicable):
Security incident detected. Unauthorized device blocked on port ${telemetryData.port || 'switch-3:port-24'}. Recommend immediate security assessment and port inspection.`,

      config_drift: `### 🔍 Root Cause:
Configuration drift detected on ${telemetryData.device_name || 'core-switch-1'} after failed SWIM deployment. Running config hash (${telemetryData.config_hash_actual || 'zxy9876543210fed'}) does not match expected baseline (${telemetryData.config_hash_expected || 'abcd1234567890ef'}).

### 📊 Endpoint Analysis:
- **Affected Device**: ${telemetryData.device_name || 'core-switch-1'}
- **Device Type**: Core Network Switch
- **Configuration Status**: DRIFT DETECTED
- **Last Known Good**: ${new Date(Date.now() - 3600000).toISOString()}
- **Drift Severity**: Medium - Policy inconsistency detected

### 📉 Business Impact:
Inconsistent network policies may cause routing asymmetry and service instability. Risk of security policy gaps and compliance violations across network infrastructure.

### 🛠 Suggested CLI Fix:
\`\`\`bash
show configuration differences
archive config rollback to last-known-good
copy flash:golden-config running-config
write memory
\`\`\`

### 🤖 Automated Remediation:
- Configuration automatically rolled back to last known good state
- Change management system updated with incident details
- Compliance monitoring re-enabled
- Automated testing of network policies initiated

### 📢 Alert Message:
⚙️ Config Drift Resolved - ${telemetryData.device_name || 'core-switch-1'} restored to baseline configuration.

### 📬 Admin Notification (if applicable):
Configuration drift resolved on critical infrastructure. Recommend review of change management procedures and automation safeguards.`
    };

    return analysisTemplates[telemetryData.type as keyof typeof analysisTemplates] || 
           `### 🔍 Root Cause:\nUnknown anomaly type detected. Manual investigation required.\n\n### 📢 Alert Message:\n🚨 Unknown anomaly detected - manual review needed.`;
  }

  setProvider(provider: 'openai' | 'anthropic' | 'gemini', apiKey: string, model?: string) {
    this.config = {
      provider,
      apiKey,
      model: model || (provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-sonnet-20240229' : 'gemini-pro')
    };
  }
}

export const llmService = new LLMService();
export type { EndpointProfile, AnomalyAnalysisRequest };