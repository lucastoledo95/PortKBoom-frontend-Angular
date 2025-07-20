import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Home } from './components/home/home';
import { Dashboard } from './components/auth/dashboard/dashboard';
//import { loginGuard } from './guards/auth-guard-guard';

export const routes: Routes = [

{ path: '', component: Home },
{ path: 'login', component: Login},  //,canActivate: [loginGuard],title: 'buceta' },
{ path: 'minha-conta', component: Dashboard },


    //{ path: ':slug**', component: Categoria }
];
