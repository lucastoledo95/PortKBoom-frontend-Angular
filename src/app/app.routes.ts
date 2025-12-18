import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Home } from './components/home/home';
import { Dashboard } from './components/auth/dashboard/dashboard';
import { Logout } from './components/auth/logout/logout';
import { Register } from './components/auth/register/register';

import { authGuardConta, authGuardLogout, authGuardLogin} from './guards/auth-guard';


export const routes: Routes = [

{ path: '', component: Home },
{ path: 'cadastro', component: Register, canActivate: [authGuardLogin] }, 
{ path: 'login', component: Login, canActivate: [authGuardLogin] },
// recuperar senha
{ path: 'minha-conta', component: Dashboard,canActivate: [authGuardConta] },
{ path: 'sair', component: Logout,canActivate: [authGuardLogout] }, // logout é realizado pelo guard.


//{ path: ':slug**', component: Categoria }


];
