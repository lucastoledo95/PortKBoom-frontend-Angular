import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, EventEmitter  } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { RedirectLogin } from './redirectLogin';

export interface LoginDados {
  login: string;
  password: string;
  recaptcha_token: string;
}

export interface retornoLoginAPI {
  ok: boolean;
  access_token: string;
  expires_in: number;
  recaptcha_token: string;
}

export interface RegisterDados {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  tipo_pessoa: 'pf' | 'pj';
  cpf_cnpj: string;
  telefone: string;
  inscricao_estadual?: string;
  // recaptcha_token: string;
}

export interface retornoRegisterAPI {
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
  private notification = inject(NotificationService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private redirect = inject(RedirectLogin);

  private refreshTimer: any;

  onLoginError: EventEmitter<void> = new EventEmitter();


  routeComponent: Record<string, string> = {
    'Home': '/',
    'Login': '/login',
    'Register': '/cadastro',
    'Dashboard': '/minha-conta',
  };

  apiUrl = 'https://api.portkboom.localhost/api';
  urlBase = 'https://api.portkboom.localhost/';

  logoUrl = `${this.urlBase}/storage/logos/logo.png`;
  bannerLoginUrl = `${this.urlBase}/storage/logos/banner-login.png`; // fazer a na db a config de promo no login via painel

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
            // console.log('Token de acesso inválido ou expirado. Tentando renovar...');
            this.onRefreshToken();
          } else {
            console.error('Erro ao buscar usuário:', error);
          }
        }
      });
    }
  }

  onLogin(dados: LoginDados) {
    this.http.post<retornoLoginAPI>(this.apiUrl + '/auth/clientes/login', dados,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.notification.error('Erro ao realizar login.');
          return;
        }
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }
        // Salva token
        localStorage.setItem('auth_token', response.access_token);
        this.notification.success('Login realizado.');
        //  Atualiza usuário logado
        this.getUser();
        // Inicia refresh automático
        this.startRefreshTimer(response.expires_in);



        const target = this.redirect.get() || '/';

        this.redirect.clear();

        this.router.navigateByUrl(target);
      },

      error: (error) => {
        // envia  evento para o componente resetar o captcha
        this.onLoginError.emit();
        if (error.status === 422 && error.error?.errors) {
          const erros = Object.values(error.error.errors).flat();
          this.notification.error(erros.join('\n'));
        } else if (error.status === 401 || error.status === 500) {
          this.notification.error(
            error.error?.message || 'Erro ao realizar login.'
          );
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

            //this.notification.success('Sessão renovada.');

            //console.log('Token renovado com sucesso:', response.access_token);


            // Reinicia timer automático
            this.startRefreshTimer(response.expires_in);

          }
          this.getUser();
        } else {
          //this.notification.error('Erro ao renovar token.');
          //console.log('Erro ao renovar token:');
          this.onLogout();
        }
      },
      error: (error) => {
        // console.error('Erro no refresh:', error);
        this.notification.error('Sessão expirada. Faça login novamente.');
        this.onLogout();
      }
    });
  }

  onLogout() {
    let headers = {};

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');

      if (token) {
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }
    }

    this.http.post(this.apiUrl + '/auth/clientes/sair', {}, {
      headers,
      withCredentials: true,
    }
    )
      .pipe(
        finalize(() => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('auth_token'); 
            localStorage.removeItem('_grecaptcha');
          }

          if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
          }
        })
      )
      .subscribe({
        next: () => {
          // logout ok
        },
        error: () => {
          // mesmo se der erro, o finalize limpa tudo
        },
      });
  }

  onRegister(dados: RegisterDados) { this.http.post<retornoRegisterAPI>( this.apiUrl + '/auth/clientes/cadastro',  dados,
    { withCredentials: true }
  ).subscribe({  next: (response) => {
      if (!response.ok) {
        this.notification.error('Erro ao realizar cadastro 404.');
        return;
      }
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      localStorage.setItem('auth_token', response.access_token);
      this.notification.success('Cadastro realizado com sucesso.');
      // atualiza usuário logado
      this.getUser();
      // ⏱ inicia refresh automático
      this.startRefreshTimer(response.expires_in);

      // redireciona para a página que o usuário estava
      const target = this.redirect.get() || '/';
      this.redirect.clear();
      this.router.navigateByUrl(target);
    },

    error: (error) => {
        // envia  evento para o componente resetar o captcha 
        this.onLoginError.emit(); //reutilizei no register
        
      if (error.status === 422 && error.error?.errors) {
        const erros = Object.values(error.error.errors).flat();
        this.notification.error(erros.join('<br>'),5000, { html: true });
      }
      else if (error.status === 401 || error.status === 500) {
        this.notification.error(
          error.error?.message || 'Erro ao realizar cadastro.'
        );
      }
      else {
        this.notification.error('Erro inesperado.');
      }
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
    const refreshTime = (expiresIn - 60) * 1000; // recebe do back end 15minutos, e em 14 minutos reatualizado o novo token
    //console.log(`[Auth Timer] Agendando renovação para daqui a ${refreshTime / 1000} segundos.`);


    this.refreshTimer = setTimeout(() => {
      //console.log('[Auth Timer] Tempo esgotado! Disparando onRefreshToken() agora.');

      this.onRefreshToken();
    }, refreshTime);
  }

  initiateSessionCheck(): void {
    // Só execute esta lógica no navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getAccessToken();

      if (token) {
        // console.log('Token encontrado. Tentando renovar a sessão...');
        this.onRefreshToken();
      }
    }
  }


}