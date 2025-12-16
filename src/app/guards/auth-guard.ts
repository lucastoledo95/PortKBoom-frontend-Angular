import { CanActivateFn, Router } from '@angular/router';
import { ApiMaster } from '../services/api-master';
import {  inject } from '@angular/core';


export const authGuardLogin: CanActivateFn = (route, state) => {
 const apiMaster = inject(ApiMaster);
 const router = inject(Router);

    if(apiMaster.isLoggedIn()){
      router.navigate(['/']);
      return false;
    }

 return true;
};

export const authGuardConta: CanActivateFn = (route, state) => {
 const apiMaster = inject(ApiMaster);
 const router = inject(Router);

    if(!apiMaster.isLoggedIn()){
      router.navigate(['/login']);
      return false;
    }

 return true;
};

export const authGuardLogout: CanActivateFn = (route, state) => {
 const apiMaster = inject(ApiMaster);
 const router = inject(Router);

      apiMaster.onLogout();
      router.navigate(['/']); 

 return false;
};
