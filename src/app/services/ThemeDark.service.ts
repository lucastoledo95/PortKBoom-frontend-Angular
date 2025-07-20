import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeDarkService {
  private darkClass = 'dark';

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  initTheme(): void {
    if (!this.isBrowser()) return;

    const userTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = userTheme === 'dark' || (!userTheme && prefersDark);

    document.documentElement.classList.toggle(this.darkClass, useDark);
  }

  toggleTheme(): void {
    if (!this.isBrowser()) return;

    const isDark = document.documentElement.classList.contains(this.darkClass);
    const newTheme = isDark ? 'light' : 'dark';

    document.documentElement.classList.toggle(this.darkClass, !isDark);
    localStorage.setItem('theme', newTheme);
  }

  isDarkMode(): boolean {
    if (!this.isBrowser()) return false;
    return document.documentElement.classList.contains(this.darkClass);
  }
}
