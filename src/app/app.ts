import { Component, inject } from '@angular/core';
import { Navbar } from "./components/navbar/navbar";
import { RouterOutlet  } from '@angular/router';
import { Notification } from "./components/notification/notification";
import { manutencaoVerificada } from './services/manutencao-verificada';
import { Manutencao } from './components/manutencao/manutencao';
import { Footer } from "./components/footer/footer";



@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Notification, Manutencao, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  //private readonly titleService = inject(TitleDynamicService);
 manut = inject(manutencaoVerificada)
  constructor(

   ) {
   this.manut.checkBackend(); // verifico se api esta retornando antes de qualquer coisa.
    
   //this.titleService.set('Hardware', 'produtos');
  }



}
