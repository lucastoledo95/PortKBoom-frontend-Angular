import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleFormatado } from '../utils/title-formatado';

@Injectable({ providedIn: 'root' })
export class TitleDynamicService {
  readonly nome = signal<string | null>(null);
  readonly descrição = signal<string | null>(null);

  private readonly fallbackNome = 'PortKBoom';
  private readonly fallbackDescricao = 'Portfólio com API de e-commerce com Angular+TailwindCSS+Laravel+API Sanctum';

  private readonly browserTitle = inject(Title);

  readonly tituloFinal = computed(() => {
    const rawNome = this.nome() ?? '';
    const rawDesc = this.descrição() ?? '';

    let nome: string;
    let desc: string;

    if (rawNome && rawDesc) {
      nome = TitleFormatado.toTitleCase(rawNome);
      desc = TitleFormatado.toTitleCase(rawDesc);
    } else if (!rawDesc && rawNome) {
      nome = TitleFormatado.toTitleCase(rawNome);
      desc = this.fallbackNome;
    } else {
      nome = this.fallbackNome;
      desc = this.fallbackDescricao;
    }

    return `${nome} | ${desc}`;
  });

  constructor() {
    effect(() => {
      this.browserTitle.setTitle(this.tituloFinal());
    });
  }

  set(nome?: string | null, descricao?: string | null) {
    this.nome.set(nome ?? null);
    this.descrição.set(descricao ?? null);
  }
}
