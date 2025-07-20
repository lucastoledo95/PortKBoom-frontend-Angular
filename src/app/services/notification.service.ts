import { Injectable, signal, effect } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  readonly notifications = signal<Notification[]>([]);

  private add(type: NotificationType, message: string, timeout = 5000) {
    const id = this.counter++;
    const noti: Notification = { id, type, message, timeout };
    this.notifications.update(n => [...n, noti]);

    // Remove após X milissegundos
    setTimeout(() => this.remove(id), timeout);
  }

  success(msg: string, timeout?: number) {
    this.add('success', msg, timeout);
  }

  error(msg: string, timeout?: number) {
    this.add('error', msg, timeout);
  }

  info(msg: string, timeout?: number) {
    this.add('info', msg, timeout);
  }

  remove(id: number) {
    this.notifications.update(n => n.filter(notif => notif.id !== id));
  }
}
