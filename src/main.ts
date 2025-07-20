import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'flowbite';

// Função para remover loading inicial
function removeInitialLoading() {
  const loading = document.getElementById('initial-loading');
  if (loading) {
    loading.style.opacity = '0';
    loading.style.pointerEvents = 'none';
    setTimeout(() => {
      if (loading.parentNode) {
        loading.parentNode.removeChild(loading);
      }
    }, 300);
  }
}

// Função para aguardar Angular estabilizar
async function waitForAngularStable(appRef: any): Promise<void> {
  return new Promise((resolve) => {
    const subscription = appRef.isStable.subscribe((stable: boolean) => {
      if (stable) {
        subscription.unsubscribe();
        resolve();
      }
    });
  });
}

bootstrapApplication(App, appConfig)
  .then(async (appRef) => {    
    try {
      await waitForAngularStable(appRef);     
      await new Promise(resolve => setTimeout(resolve, 100));
    // verifico até o momento que angular finalize o carregamento
      removeInitialLoading();
      
    } catch (error) {
      console.error('Error app initialization:', error);
      // remover loading mesmo com erro para não travar a tela
      removeInitialLoading();
    }
  })
  .catch((err) => {console.error(err);
    removeInitialLoading();
  });
// remove loading após 10 segundos
setTimeout(() => {
  const loading = document.getElementById('initial-loading');
  if (loading) {
    console.warn('Removing loading after timeout');
    removeInitialLoading();
  }
}, 10000);