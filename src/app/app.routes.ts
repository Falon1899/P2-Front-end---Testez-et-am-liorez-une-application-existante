import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';


//import du composant 
import { LoginComponent } from './pages/login/login.component';

import { HomeComponent } from './pages/home/home.component';

import { StudentsComponent } from './pages/students/students.component';

import { authGuard } from './core/guards/auth.guard';

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
  },

  {
  // Page de gestion des étudiants, accessible uniquement après connexion
  path: 'students',
  component: StudentsComponent,
  canActivate: [authGuard]
  }


];