import { Component, inject } from '@angular/core';
import { ApiMaster } from '../../../services/api-master';
import { TitleDynamicService } from '../../../services/title-dynamic.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly titleService = inject(TitleDynamicService);
  api = inject(ApiMaster)
  constructor(

  ){
    this.titleService.set('Minha conta');
 
  }
}
