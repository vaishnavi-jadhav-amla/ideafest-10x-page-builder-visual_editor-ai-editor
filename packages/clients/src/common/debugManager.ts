/* eslint-disable @typescript-eslint/no-explicit-any */

import { sendLogs } from "@znode/logger/server";
import { ILogLevel } from "@znode/types/log";

// Simple debug configuration stored in memory
class DebugManager {
  private enabledFunctions = new Set<string>();
  private logApiUrl = '/api/log'; // Your existing BFF log API

  // Enable debugging for specific function names
  enableFunction(functionNames: string | string[]) {
    const names = Array.isArray(functionNames) ? functionNames : [functionNames];
    names.forEach(name => this.enabledFunctions.add(name));
    console.log(`🔍 Debug enabled for: ${names.join(', ')}`);
    return names;
  }

  // Disable debugging for specific function names
  disableFunction(functionNames: string | string[]) {
    const names = Array.isArray(functionNames) ? functionNames : [functionNames];
    names.forEach(name => this.enabledFunctions.delete(name));
    console.log(`🔍 Debug disabled for: ${names.join(', ')}`);
    return names;
  }

  // Clear all enabled functions
  clearAll() {
    this.enabledFunctions.clear();
    console.log('🔍 All debug functions cleared');
  }

  // Check if function should be debugged
  shouldLog(functionName: string): boolean {
    return this.enabledFunctions.has(functionName);
  }

  // Get currently enabled functions
  getEnabled(): string[] {
    return Array.from(this.enabledFunctions);
  }

  // Send debug log to your existing BFF log API
  async sendLog(logData: {
    functionName: string;
    message: string;
    level: ILogLevel;
  }) {
    try {
    sendLogs([{
          area: logData.functionName,
          level: logData.level||"Info",
          message: `[DEBUG] ${logData.functionName + " "+ logData.message}`,
          timestamp: new Date().toISOString(),
        }])
    } catch (error) {
      console.error('Failed to send debug log:', error);
    }
  }
}

// Global instance
export const debugManager = new DebugManager();

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (globalThis as any).debugManager = {
    enable: (names: string | string[]) => debugManager.enableFunction(names),
    disable: (names: string | string[]) => debugManager.disableFunction(names),
    clear: () => debugManager.clearAll(),
    getEnabled: () => debugManager.getEnabled(),
  };

}

export default debugManager;
