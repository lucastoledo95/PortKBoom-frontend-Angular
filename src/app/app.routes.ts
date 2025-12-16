import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Home } from './components/home/home';
import { Dashboard } from './components/auth/dashboard/dashboard';
import { Logout } from './components/auth/logout/logout';
import { authGuardConta, authGuardLogout, authGuardLogin} from './guards/auth-guard';


export const routes: Routes = [

{ path: '', component: Home },
{ path: 'login', component: Login, canActivate: [authGuardLogin] },
{ path: 'minha-conta', component: Dashboard,canActivate: [authGuardConta] },
{ path: 'logout', component: Logout,canActivate: [authGuardLogout] },


//{ path: ':slug**', component: Categoria }
];
