import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiMaster } from './api-master';


@Injectable({
  providedIn: 'root'
})
export class manutencaoVerificada {

  private ativo = false

  constructor(
    private http: HttpClient,
    private api: ApiMaster,
  ) {

  }



  checkBackend() {
    this.http.get(this.api.apiUrl + "/status", {
    }).subscribe({
      next: (response) => {
        this.setAtivo(false);
      },
      error: (error) => {
        this.setAtivo(true);
      }
    });

    this.http.get(this.api.urlBase + "sanctum/csrf-cookie", {
    }).subscribe();

  }

  setAtivo(valor: boolean) {
    this.ativo = valor;
  }

  isAtivo(): boolean {
    return this.ativo;
  }

}