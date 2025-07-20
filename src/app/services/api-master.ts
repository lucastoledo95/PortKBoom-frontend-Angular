import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';

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

  private accessToken: string | null = null; // MEMÓRIA
  private refreshTimer: any;
  
  routeComponent: Record<string, string> = {
    'Home': '/',
    'Login': '/login',
    'Dashboard': '/minha-conta',
  };

  apiUrl = 'https://api-portkboom.test/api';
  urlBase = 'https://api-portkboom.test/';

  logoUrl = `${this.urlBase}/storage/logos/logo.png`;
  profileDefaultUrl = `${this.urlBase}/storage/logos/logo-profile.png`;
  bannerLoginUrl = `${this.urlBase}/storage/logos/banner-login.png`;

  // Método para pegar o token da memória
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Método para criar headers com Bearer token
  private createHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    if (this.accessToken) {
      return headers.set('Authorization', `Bearer ${this.accessToken}`);
    }
    return headers;
  }

  getUser() {
    this.http.get(this.apiUrl + '/user', {
    }).subscribe({
      next: (response) => {
        console.log('User data:', response);
      },
      error: (error) => {
        console.log('não achei no get user irei procurar no refresh token:', error);
        
          this.onRefreshToken();
          
        
      }
    });
  }

  onLogin(dados: LoginDados) {
    this.http.post<retornoLoginAPI>(this.apiUrl + '/auth/clientes/login', dados, {
    }).subscribe({
      next: (response) => {
        if (response.ok) {
          // Armazena access token na MEMÓRIA
          this.accessToken = response.access_token;
          
          this.notification.success('Login realizado.'); 
          this.router.navigateByUrl(this.routeComponent['Dashboard'])
          
          // Inicia refresh automático
          //this.startRefreshTimer(response.expires_in);
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
    }).subscribe({
      next: (response) => {
        if (response.ok) {
          // Atualiza access token na MEMÓRIA
          this.accessToken = response.access_token;
          this.notification.success('Token renovado com sucesso.');
          console.log('Token renovado com sucesso:', response.access_token);
         // this.getUser();
          // Reinicia timer automático
         // this.startRefreshTimer(response.expires_in); // comentado apenas para teste
        } else {
          this.notification.error('Erro ao renovar token.');
           console.log('Erro ao renovar token:');
          this.onLogout(); // comentado apenas para teste
        }
      },
      error: (error) => {
        console.error('Erro no refresh:', error);
        // this.notification.error('Sessão expirada. Faça login novamente.'); // comentado apenas para teste
        // this.onLogout(); // comentado apenas para teste
      }
    });
  }

  onLogout() {
    this.http.post(this.apiUrl + '/auth/clientes/logout', {}, {
    }).subscribe({
      next: () => {
        this.accessToken = null; // Limpa da memória
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }
        this.notification.success('Logout realizado.');
        this.router.navigateByUrl(this.routeComponent['Home']);
      },
      error: (error) => {
        // Mesmo com erro, limpa localmente
        this.accessToken = null;
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }
        this.router.navigateByUrl(this.routeComponent['Home']);
      }
    });
  }

  // Método para verificar se está logado
  isLoggedIn(): boolean {
    return this.accessToken !== null;
  }

  /* 
  // TODO: Implementar refresh automático depois
  private startRefreshTimer(expiresIn: number): void {
    // Renova 1 minuto antes de expirar
    const refreshTime = (expiresIn - 60) * 1000;
    
    this.refreshTimer = setTimeout(() => {
      this.onRefreshToken();
    }, refreshTime);
  }
  */


  /*
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