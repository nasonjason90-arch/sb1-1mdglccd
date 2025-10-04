import { Storage } from './storage';

export function logEvent(type: string, data?: Record<string, any>) {
  Storage.appendAudit({ type, ...data });
}
