import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  inject,
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';

import { ThemeDarkService } from '../../services/ThemeDark.service';
import { ApiMaster } from '../../services/api-master';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements AfterViewInit {
  private ApiMaster = inject(ApiMaster);

  api = this.ApiMaster;
  logo = this.ApiMaster.logoUrl;

  isUserDropdownOpen = false;

  readonly linkBaseClass =
    'block rounded-sm border-gray-700 px-3 py-2 text-white';

  readonly linkHoverClass =
    'hover:bg-zinc-900 hover:text-amber-600 active:bg-zinc-900 active:text-orange-500';

  readonly linkFullClass = `${this.linkBaseClass}
    md:text-white
    md:hover:bg-zinc-900
    md:hover:text-amber-600
    md:active:bg-zinc-900
    md:active:text-orange-500`;

  readonly authLinkClass =
    'text-white font-bold hover:bg-zinc-900 hover:text-amber-600 active:bg-zinc-900 active:text-orange-500 md:text-white md:hover:bg-zinc-900 md:hover:text-amber-600 md:active:bg-zinc-900 md:active:text-orange-500 ';

  readonly dropdownItemClass =
    'block px-4 py-2 text-sm text-white hover:bg-zinc-700';

  readonly buttonThemeClass =
    'p-2 rounded bg-zinc-300/10 dark:bg-zinc-950/60 text-gray-200 dark:text-gray-200';

  @ViewChild('navbarSticky', { static: false })
  navbarSticky!: ElementRef;

  @ViewChild('collapseBtn', { static: false })
  collapseBtn!: ElementRef;

  @ViewChild('hamburgerIcon', { static: false })
  hamburgerIcon!: ElementRef;

  @ViewChild('closeIcon', { static: false })
  closeIcon!: ElementRef;

  @ViewChild('headerNavbar', { static: false })
  headerNavbar!: ElementRef;

  @ViewChild('navAnchor', { static: false })
  navAnchor!: ElementRef;

  constructor(
    public theme: ThemeDarkService,
    private elRef: ElementRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.theme.initTheme();
  }

getFirstName(name?: string): string {
  if (!name) return '';
  return name.trim().split(' ')[0];
}

  toggleUserDropdown(event?: MouseEvent) {
    event?.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown() {
    this.isUserDropdownOpen = false;
  }

  closeAllMenus() {
    this.closeUserDropdown();
    this.closeMobileMenu();
  }

  closeMobileMenu() {
    if (!this.navbarSticky) return;

    const menu = this.navbarSticky.nativeElement;
    const hamburger = this.hamburgerIcon.nativeElement;
    const close = this.closeIcon.nativeElement;

    if (!menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      hamburger.classList.remove('hidden');
      close.classList.add('hidden');
    }
  }

  toggleMobileMenu() {
    const menu = this.navbarSticky.nativeElement;
    const hamburger = this.hamburgerIcon.nativeElement;
    const close = this.closeIcon.nativeElement;

    const isHidden = menu.classList.contains('hidden');

    // Fecha o dropdown do usuário sempre
    this.closeUserDropdown();

    menu.classList.toggle('hidden', !isHidden);
    hamburger.classList.toggle('hidden', isHidden);
    close.classList.toggle('hidden', !isHidden);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

      // FECHA MENUS AO TROCAR DE ROTA
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeAllMenus();
      }
    });
    

  // Clique fora da navbar → Fecha todos os menus
  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const clickedInsideNavbar =
      this.elRef.nativeElement.contains(target);

    if (!clickedInsideNavbar) {
      this.closeAllMenus();
    }
  });



    let lastScrollTop = 0;
    let isHidden = false;

    const navbar = this.headerNavbar.nativeElement;
    const anchor = this.navAnchor.nativeElement;
    if (!anchor || !navbar) return;

    const navbarHeight = navbar.offsetHeight;
    anchor.style.height = `${navbarHeight}px`;

    let ticking = false;

const handleScroll = async () => {
  const currentScroll =
    window.scrollY || document.documentElement.scrollTop;

  const diff = currentScroll - lastScrollTop;

  /* console.log('[SCROLL]', {
    currentScroll,
    lastScrollTop,
    diff,
    isHidden
  });*/

  // Sempre fecha menus ao rolar
  this.closeAllMenus();

  // DESCENDO → ESCONDE NAVBAR
  if (diff > 2 && !isHidden) { // tick para esconder 
    navbar.classList.add('-translate-y-full');
    navbar.classList.remove('translate-y-0');

    anchor.classList.add(
      'opacity-0',
      'invisible',
      'pointer-events-none'
    );
    anchor.classList.remove(
      'opacity-100',
      'visible',
      'pointer-events-auto'
    );

    isHidden = true;
  }

  // SUBINDO → MOSTRA NAVBAR
  if (diff < -1 && isHidden) { // tick para voltar 
    navbar.classList.remove('-translate-y-full');
    navbar.classList.add('translate-y-0');

    anchor.classList.remove(
      'opacity-0',
      'invisible',
      'pointer-events-none'
    );
    anchor.classList.add(
      'opacity-100',
      'visible',
      'pointer-events-auto'
    );

    isHidden = false;
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  ticking = false;
};
  //console.log('[SCROLL LISTENER REGISTRADO]');

window.addEventListener('scroll', () => {
   //console.log('[RAW SCROLL EVENT]', ticking);
  if (!ticking) {
    window.requestAnimationFrame(handleScroll);
    ticking = true;
  }
});

  }


}
