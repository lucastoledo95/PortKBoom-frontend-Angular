import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'flowbite';

let loadingRemoved = false;

function removeInitialLoading() {
  if (loadingRemoved) return;
  loadingRemoved = true;

  const loading = document.getElementById('initial-loading');
  if (loading) {
    loading.style.opacity = '0';
    loading.style.pointerEvents = 'none';
    setTimeout(() => loading.remove(), 300);
  }
}

async function waitForAngularStable(appRef: ApplicationRef): Promise<void> {
  await firstValueFrom(
    appRef.isStable.pipe(filter(stable => stable))
  );
}

bootstrapApplication(App, appConfig)
  .then(async (appRef) => {
    try {
      await waitForAngularStable(appRef);
      removeInitialLoading();
    } catch (err) {
      console.error('Error app initialization:', err);
      removeInitialLoading();
    }
  })
  .catch(err => {
    console.error(err);
    removeInitialLoading();
  });

// fallback de segurança
setTimeout(() => {
  console.warn('Removing loading after timeout');
  removeInitialLoading();
}, 500);
