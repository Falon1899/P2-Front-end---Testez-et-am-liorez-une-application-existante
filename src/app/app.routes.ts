import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';



//import du composant 
import { LoginComponent } from './pages/login/login.component';

import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'register',
    component: RegisterComponent
  },

  // Associe l'URL /login au composant de connexion
  {
  path: 'login',
  component: LoginComponent
}

];