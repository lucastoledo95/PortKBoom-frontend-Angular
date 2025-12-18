import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RedirectLogin {
  private readonly KEY = 'last_public_url';

set(url: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(this.KEY, url);
}

get(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(this.KEY);
}

  clear() {
    sessionStorage.removeItem(this.KEY);
  }
}
