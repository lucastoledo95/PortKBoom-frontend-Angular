import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Home } from './components/home/home';
import { Dashboard } from './components/auth/dashboard/dashboard';
import { authGuardConta } from './guards/auth-guard';
import { authGuardLogin } from './guards/auth-guard';


export const routes: Routes = [

{ path: '', component: Home },
{ path: 'login', component: Login, canActivate: [authGuardLogin] },
{ path: 'minha-conta', component: Dashboard,canActivate: [authGuardConta] },


    //{ path: ':slug**', component: Categoria }
];
