import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from "./components/navbar/navbar";
import { RouterOutlet  } from '@angular/router';
import { Notification } from "./components/notification/notification";
import { manutencaoVerificada } from './services/manutencao-verificada';
import { Manutencao } from './components/manutencao/manutencao';
import { Footer } from "./components/footer/footer";
import { ApiMaster } from './services/api-master';


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


  constructor(
   ) {   

    }



  ngOnInit(): void {
    // ngOnInit é o lugar perfeito para lógicas de inicialização.

       //this.titleService.set('Hardware', 'produtos');
    
       // 1. Verifico se a API está online antes de qualquer coisa.
    this.manut.checkBackend(); 
  
   
    
    // 2. Verifico se existe uma sessão anterior para reativar.
    this.apiMaster.initiateSessionCheck();
  }

}
