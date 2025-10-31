import { isPlatformBrowser } from '@angular/common'; // <-- IMPORTE
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core'; // <-- IMPORTE
import { ApiMaster } from './api-master';


@Injectable({
  providedIn: 'root'
})
export class manutencaoVerificada {

  private ativo = false
  private platformId = inject(PLATFORM_ID);  

  constructor(
    private http: HttpClient,
    private api: ApiMaster,
  ) {

  }

  checkBackend() {
    if (isPlatformBrowser(this.platformId)) { // verificar se estou no browser
      this.http.get(this.api.apiUrl + "/status").subscribe({
        next: (response) => {
          this.setAtivo(false);
        },
        error: (error) => {
          this.setAtivo(true);
        }
      });

    this.http.get(this.api.urlBase + "sanctum/csrf-cookie", {         }).subscribe();

   }
  }

  setAtivo(valor: boolean) {
    this.ativo = valor;
  }

  isAtivo(): boolean {
    return this.ativo;
  }

}