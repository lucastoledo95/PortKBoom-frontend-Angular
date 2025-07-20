import { Component, inject } from '@angular/core';
import { ApiMaster } from '../../../services/api-master';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  api = inject(ApiMaster)
  constructor(

  ){
    this.api.getUser();
 
  }
}
