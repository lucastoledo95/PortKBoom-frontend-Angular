import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  timeout?: number;
  html?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  readonly notifications = signal<Notification[]>([]);

  private add(type: NotificationType, message: string, timeout = 5000,options?: { html?: boolean }) {
    const id = this.counter++;

    const noti: Notification = { 
      id, type, message, timeout , html: options?.html ?? false
    };

    this.notifications.update(n => [...n, noti]);

    // Remove após 5000 milissegundos = 5 segundos
    setTimeout(() => this.remove(id), timeout);
  }

  success(msg: string, timeout?: number, options?: { html?: boolean }) {
    this.add('success', msg, timeout, options);
  }

  error(msg: string, timeout?: number, options?: { html?: boolean }) {
    this.add('error', msg, timeout, options);
  }

  info(msg: string, timeout?: number, options?: { html?: boolean }) {
    this.add('info', msg, timeout, options);
  }

  remove(id: number) {
    this.notifications.update(n => n.filter(notif => notif.id !== id));
  }
}
