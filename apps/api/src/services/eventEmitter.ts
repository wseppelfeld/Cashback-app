import { CashbackEvent } from '@cashback/shared';

type EventHandler = (event: CashbackEvent) => Promise<void>;

export class EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async emit(eventType: string, event: CashbackEvent): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    
    // Execute all handlers concurrently
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      })
    );
  }

  off(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }
}