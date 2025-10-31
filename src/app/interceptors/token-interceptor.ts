import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiMaster } from '../services/api-master'; 

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiMaster = inject(ApiMaster);
  const token = apiMaster.getAccessToken(); 

  
  if (token) {
    // Clona a requisição APENAS se existir um token, e adiciona o cabeçalho
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Se não houver token, passa a requisição original
  return next(req);
};