// ============================================================================
// Native Windows System Control Bridge Client
// Communicates with EyeHandBridge.exe via fast local HTTP REST / IPC
// ============================================================================

export interface NativeBridgeStatus {
  online: boolean;
  emergencyStopped: boolean;
  systemControlEnabled: boolean;
  cursor: { x: number; y: number };
  primary: { width: number; height: number };
  virtualScreen: { x: number; y: number; width: number; height: number };
}

class NativeBridgeClient {
  private baseUrl = 'http://127.0.0.1:48920';
  private isConnected = false;
  private lastStatusCheck = 0;
  private cachedStatus: NativeBridgeStatus | null = null;
  private pendingMove: { x: number; y: number; nx: number; ny: number } | null = null;
  private isSendingMove = false;

  constructor() {
    this.pollBridge();
    setInterval(() => this.pollBridge(), 2000);
  }

  public async pollBridge(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${this.baseUrl}/api/status`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.isConnected = true;
        this.cachedStatus = {
          online: true,
          emergencyStopped: !!data.emergencyStopped,
          systemControlEnabled: !!data.systemControlEnabled,
          cursor: data.cursor || { x: 0, y: 0 },
          primary: data.primary || { width: window.innerWidth, height: window.innerHeight },
          virtualScreen: data.virtualScreen || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
        };
        return true;
      }
    } catch {
      this.isConnected = false;
    }
    return false;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getCachedStatus(): NativeBridgeStatus | null {
    return this.cachedStatus;
  }

  public async sendAction(action: string, params: Record<string, any> = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const payload = { action, ...params };
      const res = await fetch(`${this.baseUrl}/api/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.success;
      }
    } catch (e) {
      console.warn('[NativeBridge] Failed to send action:', action, e);
    }
    return false;
  }

  /**
   * High-speed throttled cursor mover to prevent HTTP backlog while ensuring 60 FPS
   */
  public queueMove(x: number, y: number, nx: number, ny: number) {
    this.pendingMove = { x, y, nx, ny };
    if (!this.isSendingMove) {
      this.flushMove();
    }
  }

  private async flushMove() {
    if (!this.pendingMove || !this.isConnected) return;
    this.isSendingMove = true;
    const move = this.pendingMove;
    this.pendingMove = null;

    try {
      await this.sendAction('move', move);
    } finally {
      this.isSendingMove = false;
      if (this.pendingMove) {
        requestAnimationFrame(() => this.flushMove());
      }
    }
  }

  public async click(button: 'left' | 'right' | 'double' = 'left') {
    return this.sendAction('click', { button });
  }

  public async mouseDown(button: 'left' | 'right' = 'left') {
    return this.sendAction('down', { button });
  }

  public async mouseUp(button: 'left' | 'right' = 'left') {
    return this.sendAction('up', { button });
  }

  public async scroll(delta: number) {
    return this.sendAction('scroll', { delta });
  }

  public async keyPress(key: string) {
    return this.sendAction('key', { key });
  }

  public async openApp(target: 'browser' | 'explorer' | 'calculator' | 'settings') {
    return this.sendAction('app', { target });
  }

  public async emergencyStop() {
    return this.sendAction('emergency_stop');
  }

  public async resume() {
    return this.sendAction('resume');
  }

  public async setSystemControlEnabled(enabled: boolean) {
    return this.sendAction('toggle_system_control', { enabled });
  }
}

export const nativeBridge = new NativeBridgeClient();
