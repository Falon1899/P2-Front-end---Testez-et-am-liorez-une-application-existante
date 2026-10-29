import { Component } from '@angular/core';

//import des composants qui permettent, dans l'ordre, de relier le formulaire HTML au code TypeScript, de faciliter la création et la gestion des champs du formulaire, et de définir des règles de validation
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { UserService } from '../../core/service/user.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule], // rend les fonctionnalités de ReactiveFormsModule disponibles dans le template HTML du composant
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = new FormBuilder().nonNullable;
  private userService = inject(UserService);

  // Définit les champs du formulaire et leurs règles de validation
loginForm = this.fb.group({
  login: ['', Validators.required],
  password: ['', Validators.required]  
});

// Indique si une requête d'authentification est en cours
isLoading = false;

// Contient le message d'erreur à afficher
errorMessage = '';

// Contient le message de réussite à afficher
successMessage = '';


// Traite la soumission du formulaire après validation des champs
onSubmit(): void {
  if (this.loginForm.valid && !this.isLoading) {

    // Réinitialise les messages et active le chargement
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = this.loginForm.getRawValue();

    this.userService.login(credentials).subscribe({
      next: (token) => {
        this.successMessage = 'Authentification réussie !';
        this.isLoading = false;
      },
      error: (error) => {
        try {
          const serverError = JSON.parse(error.error);
          this.errorMessage = serverError.message || 'Erreur de connexion.';
        } catch {
          this.errorMessage = 'Identifiant ou mot de passe incorrect.';
        }

        this.isLoading = false;
      }
    });
  }
}
}
