import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable , PLATFORM_ID } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { finalize } from 'rxjs/operators'; 

export interface LoginDados {
  login: string;
  password: string;
  // recaptcha_token: string;
}
export interface retornoLoginAPI {
  ok: boolean;
  access_token: string;
  expires_in: number;
  // recaptcha_token: string;
}

export interface retornoRefreshAPI {
  ok: boolean;
  access_token: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})

export class ApiMaster {
  private http = inject(HttpClient);
  private notification = inject(NotificationService)
  private router = inject(Router)
  private platformId = inject(PLATFORM_ID);

  private refreshTimer: any;


  routeComponent: Record<string, string> = {
    'Home': '/',
    'Login': '/login',
    'Dashboard': '/minha-conta',
  };

  apiUrl = 'https://api.portkboom.localhost/api';
  urlBase = 'https://api.portkboom.localhost/';

  logoUrl = `${this.urlBase}/storage/logos/logo.png`;
  profileDefaultUrl = `${this.urlBase}/storage/logos/logo-profile.png`;
  bannerLoginUrl = `${this.urlBase}/storage/logos/banner-login.png`;

user: any = null;



  // Método para pegar o token do localStorage no SSR do angular
  getAccessToken(): string | null {
    // verificando se é browser
    if (isPlatformBrowser(this.platformId)) {
      // Este código só roda no navegador
      return localStorage.getItem('auth_token');
    }
    // No servidor, sempre retorna null pois não há sessão
    return null;
  }


  getUser() {
     if (isPlatformBrowser(this.platformId)) {
    this.http.get(this.apiUrl + '/user', {
    }).subscribe({
      next: (response) => {
        this.user = response;
        console.log('User data:', response);

      },
      error: (error) => {
        // refresh apenas se o erro for 401 (negado)
        if (error.status === 401) {
          console.log('Token de acesso inválido ou expirado. Tentando renovar...');
          this.onRefreshToken();
        } else {
          console.error('Erro ao buscar usuário:', error);
        }
      }
    });
  }
  }

  onLogin(dados: LoginDados) {
    this.http.post<retornoLoginAPI>(this.apiUrl + '/auth/clientes/login', dados, {
      withCredentials: true 
    }).subscribe({
      next: (response) => {
        if (response.ok) {
          
          if (isPlatformBrowser(this.platformId)) {

          // salva o access token no localStorage
          localStorage.setItem('auth_token', response.access_token);
          this.notification.success('Login realizado.'); 
          this.getUser();
          this.router.navigateByUrl(this.routeComponent['Dashboard'])
          
          // Inicia refresh automático
          this.startRefreshTimer(response.expires_in);
          }          
        } else {
          this.notification.error('Erro ao realizar login.');
        }
      },
      error: (error) => {
        if (error.status === 422 && error.error?.errors) {
          const erros = Object.values(error.error.errors).flat();
          this.notification.error(erros.join('\n'));
        } else if (error.status === 401 || error.status === 500) {
          this.notification.error(error.error?.message || 'Erro ao realizar login.');
        } else {
          this.notification.error('Erro inesperado.');
        }
      }
    });
  }

  onRefreshToken() {
    this.http.post<retornoRefreshAPI>(this.apiUrl + '/auth/clientes/refresh-token', {}, {
      withCredentials: true 
    }).subscribe({
      next: (response) => {
        if (response.ok) {

          if (isPlatformBrowser(this.platformId)) {
          // atualiza o novo access token no localStorage
          localStorage.setItem('auth_token', response.access_token);
         
          this.notification.success('Sessão renovada.');
  
          console.log('Token renovado com sucesso:', response.access_token);
        
         
          // Reinicia timer automático
          this.startRefreshTimer(response.expires_in);

          }
          this.getUser();
        } else {
          this.notification.error('Erro ao renovar token.');
           console.log('Erro ao renovar token:');
          this.onLogout(); // comentado apenas para teste
        }
      },
      error: (error) => {
        console.error('Erro no refresh:', error);
        this.notification.error('Sessão expirada. Faça login novamente.'); // comentado apenas para teste
         this.onLogout(); // comentado apenas para teste
      }
    });
  }

onLogout() {
  this.http.post(this.apiUrl + '/auth/clientes/logout', {}, {
    withCredentials: true
  }).pipe(
    finalize(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth_token');
          

        }
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }

        this.router.navigateByUrl(this.routeComponent['Home']);
      })
    ).subscribe({
      next: () => {
        // Opcional: Mostrar uma notificação se o logout no servidor funcionou
       console.log('Logout realizado com sucesso.');
      }
    });
  }


  // Método para verificar se está logado
  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  // acho q  nao esta funcionando
  // TODO: Implementar refresh automático depois
  private startRefreshTimer(expiresIn: number): void {
    // Renova 1 minuto antes de expirar
    const refreshTime = (expiresIn - 60) * 1000;
  console.log(`[Auth Timer] Agendando renovação para daqui a ${refreshTime / 1000} segundos.`);

  
    this.refreshTimer = setTimeout(() => {
          console.log('[Auth Timer] Tempo esgotado! Disparando onRefreshToken() agora.');

      this.onRefreshToken();
    }, refreshTime);
  }
  
  initiateSessionCheck(): void {
    // Só execute esta lógica no navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getAccessToken();

      if (token) {
        console.log('Token encontrado. Tentando renovar a sessão...');
        this.onRefreshToken();
        
        
      }
    }
  }

  /* não to usando por enquanto.
  // Refresh automático - renova 1 minuto antes de expirar
  private startRefreshTimer(expiresIn: number): void {
    // Limpa timer anterior se existir
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Renova 1 minuto antes de expirar (ou 30 segundos se for menos de 1 minuto)
    const refreshTime = Math.max((expiresIn - 60), 30) * 1000;
    
  /  this.refreshTimer = setTimeout(() => {
      this.refreshTokenSilent();
    }, refreshTime);
  }

  // Refresh silencioso (sem notificações)
  private refreshTokenSilent(): void {
    this.http.post<retornoRefreshAPI>(this.apiUrl + '/auth/clientes/refresh-token', {}, {
    }).subscribe({
      next: (response) => {
        if (response.ok) {
          this.accessToken = response.access_token;
          this.startRefreshTimer(response.expires_in);
        } else {
          this.onLogout();
        }
      },
      error: () => {
        this.onLogout();
      }
    });
  }

    // Método silencioso para o interceptor (sem notificações)
  tryRefreshTokenSilent(): Observable<boolean> {
    return this.http.post<retornoRefreshAPI>(this.apiUrl + '/auth/clientes/refresh-token', {}, {
    }).pipe(
      map(response => {
        if (response.ok) {
          this.accessToken = response.access_token;
          return true;
        }
        return false;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }
    */
}