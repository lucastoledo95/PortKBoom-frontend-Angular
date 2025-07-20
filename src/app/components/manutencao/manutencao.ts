import { Component, inject } from '@angular/core';
import { TitleDynamicService } from '../../services/title-dynamic.service';

@Component({
  selector: 'app-manutencao',
  imports: [],
  templateUrl: './manutencao.html',
  styleUrl: './manutencao.css'
})
export class Manutencao {
  title = inject(TitleDynamicService)
  constructor(){
this.title.set('Estamos em manutenção')
  }

}
