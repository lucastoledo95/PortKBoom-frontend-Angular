import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiMaster } from '../services/api-master'; 

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiMaster = inject(ApiMaster);
  
  // Sempre adiciona withCredentials para cookies
  let authReq = req.clone({
    withCredentials: true
  });

  // Se tem access token, adiciona Bearer
  const token = apiMaster.getAccessToken();
  if (token) {
    authReq = authReq.clone({
    // setHeaders: {
     //   Authorization: `Bearer ${token}`
    //  }
    });
  }

  return next(authReq);
};