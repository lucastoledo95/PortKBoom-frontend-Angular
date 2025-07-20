import { Component, inject } from '@angular/core';
import { TitleDynamicService } from '../../services/title-dynamic.service';
import { ApiMaster } from '../../services/api-master';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private readonly titleService = inject(TitleDynamicService);
 // api = inject(ApiMaster)
  constructor(

  ) {
    this.titleService.set();

    //this.api.getUser();
  }









}
