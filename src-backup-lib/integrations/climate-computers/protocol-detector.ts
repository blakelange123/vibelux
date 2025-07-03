/**
 * Protocol Detection Utility
 * 
 * Automatically detects communication protocols for climate computers
 */

export interface ProtocolInfo {
  protocol: 'modbus' | 'bacnet' | 'mqtt' | 'rest' | 'opcua' | 'snmp' | 'unknown';
  confidence: number; // 0-100
  details: {
    version?: string;
    features?: string[];
    authentication?: 'none' | 'basic' | 'token' | 'certificate';
    encryption?: boolean;
  };
}

export interface PortScanResult {
  port: number;
  open: boolean;
  service?: string;
  protocol?: ProtocolInfo;
  responseTime?: number;
}

export class ProtocolDetector {
  private commonPorts: Record<string, number[]> = {
    modbus: [502, 503],
    bacnet: [47808, 47809],
    mqtt: [1883, 8883],
    rest: [80, 443, 8080, 8443],
    opcua: [4840, 4843],
    snmp: [161, 162]
  };

  /**
   * Scan a host for common industrial protocols
   */
  async scanHost(host: string, customPorts?: number[]): Promise<PortScanResult[]> {
    const results: PortScanResult[] = [];
    const portsToScan = customPorts || this.getAllCommonPorts();

    // In browser environment, we simulate the scan
    if (typeof window !== 'undefined') {
      return this.simulateScan(host, portsToScan);
    }

    // Real implementation would use network libraries
    for (const port of portsToScan) {
      try {
        const result = await this.checkPort(host, port);
        results.push(result);
      } catch (error) {
        results.push({
          port,
          open: false
        });
      }
    }

    return results;
  }

  /**
   * Detect protocol on a specific port
   */
  async detectProtocol(host: string, port: number): Promise<ProtocolInfo> {
    // In browser, return simulated results
    if (typeof window !== 'undefined') {
      return this.simulateProtocolDetection(port);
    }

    // Real implementation would probe the port
    return {
      protocol: 'unknown',
      confidence: 0,
      details: {}
    };
  }

  /**
   * Auto-detect best protocol for a climate computer
   */
  async autoDetectBestProtocol(host: string): Promise<{
    recommended: ProtocolInfo;
    alternatives: ProtocolInfo[];
  }> {
    const scanResults = await this.scanHost(host);
    const openPorts = scanResults.filter(r => r.open);

    if (openPorts.length === 0) {
      return {
        recommended: {
          protocol: 'unknown',
          confidence: 0,
          details: {}
        },
        alternatives: []
      };
    }

    // Sort by confidence and protocol preference
    const protocols = openPorts
      .filter(r => r.protocol && r.protocol.protocol !== 'unknown')
      .map(r => r.protocol!)
      .sort((a, b) => {
        // Prefer higher confidence
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        // Then prefer certain protocols
        const preference = ['modbus', 'bacnet', 'rest', 'mqtt', 'opcua', 'snmp'];
        return preference.indexOf(a.protocol) - preference.indexOf(b.protocol);
      });

    return {
      recommended: protocols[0] || {
        protocol: 'unknown',
        confidence: 0,
        details: {}
      },
      alternatives: protocols.slice(1)
    };
  }

  /**
   * Get protocol capabilities
   */
  getProtocolCapabilities(protocol: string): string[] {
    const capabilities: Record<string, string[]> = {
      modbus: [
        'Real-time data reading',
        'Register writing',
        'High-speed polling',
        'Industrial standard',
        'Wide device support'
      ],
      bacnet: [
        'Building automation',
        'HVAC integration',
        'Alarm management',
        'Scheduling',
        'Trending'
      ],
      mqtt: [
        'Publish/Subscribe',
        'Low bandwidth',
        'Mobile friendly',
        'Cloud ready',
        'Event-driven'
      ],
      rest: [
        'Web standard',
        'Easy integration',
        'JSON support',
        'Stateless',
        'Scalable'
      ],
      opcua: [
        'Enterprise ready',
        'Security built-in',
        'Complex data types',
        'Historical data',
        'Redundancy'
      ],
      snmp: [
        'Network monitoring',
        'Trap notifications',
        'MIB support',
        'Legacy compatible',
        'Simple protocol'
      ]
    };

    return capabilities[protocol] || [];
  }

  /**
   * Get recommended settings for a protocol
   */
  getProtocolSettings(protocol: string): Record<string, any> {
    const settings: Record<string, any> = {
      modbus: {
        timeout: 5000,
        retries: 3,
        unitId: 1,
        endianness: 'BE',
        maxConcurrentRequests: 1
      },
      bacnet: {
        timeout: 3000,
        retries: 3,
        deviceInstance: 1234,
        networkNumber: 0,
        maxAPDU: 1476
      },
      mqtt: {
        keepalive: 60,
        qos: 1,
        clean: true,
        clientId: `vibelux_${Date.now()}`,
        reconnectPeriod: 5000
      },
      rest: {
        timeout: 30000,
        retries: 3,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    };

    return settings[protocol] || {};
  }

  private getAllCommonPorts(): number[] {
    const ports = new Set<number>();
    Object.values(this.commonPorts).forEach(portList => {
      portList.forEach(port => ports.add(port));
    });
    return Array.from(ports).sort((a, b) => a - b);
  }

  private async checkPort(host: string, port: number): Promise<PortScanResult> {
    // This would be implemented with actual network libraries
    // For now, return simulated result
    return {
      port,
      open: false
    };
  }

  private simulateScan(host: string, ports: number[]): PortScanResult[] {
    // Simulate finding some common climate computer protocols
    const results: PortScanResult[] = [];

    for (const port of ports) {
      const isOpen = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7; // 30% chance of open port
      
      if (isOpen) {
        results.push({
          port,
          open: true,
          service: this.getServiceName(port),
          protocol: this.simulateProtocolDetection(port),
          responseTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100) + 10
        });
      } else {
        results.push({
          port,
          open: false
        });
      }
    }

    return results;
  }

  private simulateProtocolDetection(port: number): ProtocolInfo {
    // Simulate protocol detection based on port
    if (this.commonPorts.modbus.includes(port)) {
      return {
        protocol: 'modbus',
        confidence: 95,
        details: {
          version: 'TCP',
          features: ['read-holding-registers', 'write-single-register', 'write-multiple-registers'],
          authentication: 'none',
          encryption: false
        }
      };
    }

    if (this.commonPorts.bacnet.includes(port)) {
      return {
        protocol: 'bacnet',
        confidence: 90,
        details: {
          version: 'IP',
          features: ['read-property', 'write-property', 'subscribe-cov', 'alarms'],
          authentication: 'none',
          encryption: false
        }
      };
    }

    if (this.commonPorts.mqtt.includes(port)) {
      return {
        protocol: 'mqtt',
        confidence: 85,
        details: {
          version: port === 8883 ? '5.0' : '3.1.1',
          features: ['publish', 'subscribe', 'qos', 'retained-messages'],
          authentication: 'basic',
          encryption: port === 8883
        }
      };
    }

    if (this.commonPorts.rest.includes(port)) {
      return {
        protocol: 'rest',
        confidence: 80,
        details: {
          version: 'HTTP/1.1',
          features: ['json', 'authentication', 'pagination', 'filtering'],
          authentication: 'token',
          encryption: port === 443 || port === 8443
        }
      };
    }

    return {
      protocol: 'unknown',
      confidence: 0,
      details: {}
    };
  }

  private getServiceName(port: number): string {
    const services: Record<number, string> = {
      502: 'Modbus TCP',
      503: 'Modbus TCP (alt)',
      47808: 'BACnet/IP',
      47809: 'BACnet/IP (alt)',
      1883: 'MQTT',
      8883: 'MQTT (TLS)',
      80: 'HTTP',
      443: 'HTTPS',
      8080: 'HTTP (alt)',
      8443: 'HTTPS (alt)',
      4840: 'OPC UA',
      4843: 'OPC UA (TLS)',
      161: 'SNMP',
      162: 'SNMP Trap'
    };

    return services[port] || 'Unknown';
  }
}

// Singleton instance
export const protocolDetector = new ProtocolDetector();