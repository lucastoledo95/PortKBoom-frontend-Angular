import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, Renderer2, computed, inject } from '@angular/core';
import { ThemeDarkService } from '../../services/ThemeDark.service';
import { isPlatformBrowser } from '@angular/common';
import { ApiMaster } from '../../services/api-master';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})


export class Navbar implements AfterViewInit {
 private ApiMaster = inject(ApiMaster);
  logo = this.ApiMaster.logoUrl;
  profileDefaultUrl = this.ApiMaster.profileDefaultUrl;


  readonly linkBaseClass = 'block rounded-sm border-gray-700 px-3 py-2 text-white';
  readonly linkHoverClass = 'hover:bg-zinc-900 hover:text-amber-600 active:bg-zinc-900 active:text-orange-500';
  readonly linkFullClass = `${this.linkBaseClass} md:text-white md:hover:bg-zinc-900 md:hover:text-amber-600 md:active:bg-zinc-900 md:active:text-orange-500`;
  readonly authLinkClass = 'text-white font-bold hover:bg-zinc-900 hover:text-amber-600 active:bg-zinc-900 active:text-orange-500 md:text-white md:hover:bg-zinc-900 md:hover:text-amber-600 md:active:bg-zinc-900 md:active:text-orange-500';
  readonly dropdownItemClass = 'block px-4 py-2 text-sm text-white hover:bg-zinc-700';
  readonly buttonThemeClass = 'p-2 rounded bg-zinc-300/10 dark:bg-zinc-950/60 text-gray-200 dark:text-gray-200';

  @ViewChild('navbarSticky', { static: false }) navbarSticky!: ElementRef;
  @ViewChild('collapseBtn', { static: false }) collapseBtn!: ElementRef;
  @ViewChild('hamburgerIcon', { static: false }) hamburgerIcon!: ElementRef;
  @ViewChild('closeIcon', { static: false }) closeIcon!: ElementRef;
  @ViewChild('headerNavbar', { static: false }) headerNavbar!: ElementRef;
  @ViewChild('navAnchor', { static: false }) navAnchor!: ElementRef;



  constructor(
    public theme: ThemeDarkService,
    private renderer: Renderer2,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.theme.initTheme()

  }


  ngAfterViewInit(): void {


    if (!isPlatformBrowser(this.platformId)) return;





    function wait(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function waitForStableScroll(callback: () => void, delay = 100) {
      let lastScrollY = window.scrollY;
      let timeout: any = null;

      function check() {
        if (Math.abs(window.scrollY - lastScrollY) < 2) {
          callback();
        } else {
          lastScrollY = window.scrollY;
          timeout = setTimeout(check, delay);
        }
      }

      setTimeout(check, delay);
    }

    // ---- Fechar menu ----
    const menu = this.navbarSticky.nativeElement;
    const button = this.collapseBtn.nativeElement;
    const hamburgerIcon = this.hamburgerIcon.nativeElement;
    const closeIcon = this.closeIcon.nativeElement;

    function toggleIcons() {
      const isMenuHidden = menu.classList.contains('hidden');
      if (isMenuHidden) {
        // Menu fechado - mostrar hambúrguer
        hamburgerIcon.classList.remove('hidden', 'rotate-90');
        closeIcon.classList.add('hidden');
        closeIcon.classList.remove('rotate-90');
      } else {
        // Menu aberto - mostrar X com rotação
        hamburgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        closeIcon.classList.add('rotate-90');
      }
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          toggleIcons();
        }
      });
    });

    observer.observe(menu, { attributes: true });

    function closeMenu() {
      if (!menu.classList.contains('hidden')) {
        const clickEvent = new Event('click', { bubbles: true });
        button.dispatchEvent(clickEvent);
      }
    }

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !button.contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('scroll', function () {
      closeMenu();
    });

    // ---- Scroll Transição Navbar ----
    const anchor = this.navAnchor.nativeElement;
    const navbar = this.headerNavbar.nativeElement;

    if (!anchor || !navbar) return;

    let lastScrollTop = 0;
    let isHidden = false;
    let isTransitioning = false;

    const navbarHeight = navbar.offsetHeight;
    anchor.style.height = `${navbarHeight}px`;

    const SCROLL_THRESHOLD = 10;
    let ticking = false;

    const showNavbar = async () => {
      isTransitioning = true;
      navbar.classList.remove("-translate-y-full");
      navbar.classList.add("translate-y-0");

      anchor.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
      anchor.classList.add('opacity-100', 'visible', 'pointer-events-auto');

      await wait(300);
      isHidden = false;
      isTransitioning = false;
    };

    const hideNavbar = async () => {
      isTransitioning = true;
      navbar.classList.add("-translate-y-full");
      navbar.classList.remove("translate-y-0");

      anchor.classList.add('opacity-0', 'invisible', 'pointer-events-none');
      anchor.classList.remove('opacity-100', 'visible', 'pointer-events-auto');

      await wait(300);
      isHidden = true;
      isTransitioning = false;
    };

    const handleScroll = async () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;

      if (currentScroll <= navbarHeight) {
        navbar.classList.remove("-translate-y-full");
        navbar.classList.add("translate-y-0");

        anchor.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        anchor.classList.add('opacity-100', 'visible', 'pointer-events-auto');

        isHidden = false;
        lastScrollTop = 0;
        ticking = false;
        return;
      }

      if (isTransitioning || Math.abs(currentScroll - lastScrollTop) < SCROLL_THRESHOLD) {
        ticking = false;
        return;
      }

      if (currentScroll > lastScrollTop && !isHidden) {
        await hideNavbar();
      } else if (currentScroll < lastScrollTop && isHidden) {
        await showNavbar();
      }

      lastScrollTop = currentScroll;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    });

    waitForStableScroll(handleScroll);

  }
}
