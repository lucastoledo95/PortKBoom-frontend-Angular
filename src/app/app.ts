import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from "./components/navbar/navbar";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Notification } from "./components/notification/notification";
import { manutencaoVerificada } from './services/manutencao-verificada';
import { Manutencao } from './components/manutencao/manutencao';
import { Footer } from "./components/footer/footer";
import { ApiMaster } from './services/api-master';
import { RedirectLogin } from './services/redirectLogin';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Notification, Manutencao, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  //private readonly titleService = inject(TitleDynamicService);
  manut = inject(manutencaoVerificada)
  private apiMaster = inject(ApiMaster);
  private router = inject(Router);
  private redirect = inject(RedirectLogin);

  constructor(
  ) { }

  ngOnInit(): void {
    //this.titleService.set('Hardware', 'produtos');

    // Verifico se a API está online antes de qualquer coisa.
    this.manut.checkBackend();

    // Verifico se existe uma sessão anterior para reativar token de acesso.
    this.apiMaster.initiateSessionCheck();

    // EVENTO PARA DETECTAR A PÁGINA ANTERIOR AO REALIZAR O LOGIN
   this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        // SE ESTIVER LOGADO → NÃO SALVA
        if (this.apiMaster.isLoggedIn()) return;


        //  páginas que NÃO devem ser salvas na sessao do login 
        if (
          event.urlAfterRedirects.startsWith('/login') ||
          event.urlAfterRedirects.startsWith('/dashboard') ||
          event.urlAfterRedirects.startsWith('/cadastro') ||
          event.urlAfterRedirects.startsWith('/sair') ||
          event.urlAfterRedirects.startsWith('/admin')
        ) {
          return;
        }

        this.redirect.set(event.urlAfterRedirects);
         //console.log('last url salva:', event.urlAfterRedirects);
      });
  





  }

}
