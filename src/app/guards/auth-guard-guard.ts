import { CanActivateFn, Router } from '@angular/router';
import { ApiMaster } from '../services/api-master';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';

// GUARD para proteger rotas autenticadas (/minha-conta, /dashboard, etc)
export const authGuard: CanActivateFn = (route, state) => {
   return true;
  /*
  const apiMaster = inject(ApiMaster);
  const router = inject(Router);

  // Se tem token na memória, está logado
  if (apiMaster.isLoggedIn()) {
    return true;
  }

  // Se não tem token, tenta renovar com refresh token
  return apiMaster.renewToken().pipe(
    map(() => {
      // Se conseguiu renovar, permite acesso
      return true;
    }),
    catchError(() => {
      // Se não conseguiu renovar, redireciona para login
      router.navigate(['/login']);
      return of(false);
    })
  );
};

// GUARD para evitar acesso ao login quando já logado
export const loginGuard: CanActivateFn = (route, state) => {
  const apiMaster = inject(ApiMaster);
  const router = inject(Router);

  // Se já está logado, redireciona para dashboard
  if (apiMaster.isLoggedIn()) {
    router.navigate(['/minha-conta']);
    return false;
  }

  // Tenta verificar se tem refresh token válido
  return apiMaster.renewToken().pipe(
    map(() => {
      // Se conseguiu renovar, já está logado - redireciona
      router.navigate(['/minha-conta']);
      return false;
    }),
    catchError(() => {
      // Se não conseguiu renovar, permite acesso ao login
      return of(true);
    })
  );
};

// GUARD para logout (opcional - limpa tudo antes de sair)
export const logoutGuard: CanActivateFn = (route, state) => {
  const apiMaster = inject(ApiMaster);
  
  // Executa logout
  apiMaster.logout();
  
  // Sempre permite "acesso" (na verdade vai redirecionar para login)
  return true;
  */
};