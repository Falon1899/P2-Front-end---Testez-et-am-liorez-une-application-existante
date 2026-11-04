
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // Facilite la création et la gestion du formulaire
  private fb = new FormBuilder().nonNullable;

  // Injecte le service permettant de communiquer avec le backend
  private userService = inject(UserService);

  // Injecte le routeur pour permettre la navigation après connexion
  private router = inject(Router);

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

    // Vérifie que le formulaire est valide et qu'aucune requête n'est en cours
    if (this.loginForm.valid && !this.isLoading) {

      // Réinitialise les messages et active le chargement
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Récupère les identifiants saisis
      const credentials = this.loginForm.getRawValue();

      // Envoie les identifiants au backend
      this.userService.login(credentials).subscribe({

        next: (token) => {

          // Enregistre le JWT dans le stockage de session
          sessionStorage.setItem('token', token);

          // Termine le chargement
          this.isLoading = false;

          // Redirige l'utilisateur vers la liste des étudiants
          this.router.navigate(['/students']);
        },

        error: (error) => {

          // Identifiant ou mot de passe incorrect
          if (error.status === 401) {
            this.errorMessage = 'Identifiant ou mot de passe incorrect.';
          } else {

            // Autres erreurs : serveur indisponible, problème réseau, etc.
            this.errorMessage = 'Une erreur est survenue lors de la connexion.';
          }

          // Termine le chargement
          this.isLoading = false;
        }
      });
    }
  }
}
