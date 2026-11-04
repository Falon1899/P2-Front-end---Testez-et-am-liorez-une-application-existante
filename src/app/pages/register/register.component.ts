import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Register } from '../../core/models/Register';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';   

@Component({
  selector: 'app-register',
  imports: [CommonModule, MaterialModule],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  
  // Permet de naviguer vers une autre page après l'inscription
  private router = inject(Router);
  // Permet de lire les paramètres de l'URL
  private route = inject(ActivatedRoute);

  registerForm: FormGroup = new FormGroup({});
  submitted: boolean = false;

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    const registerUser: Register = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      login: this.registerForm.get('login')?.value,
      password: this.registerForm.get('password')?.value
    };
    this.userService.register(registerUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
      () => {
        // Confirme la création de l'utilisateur
        alert('Inscription réussie !');

        // Vérifie si le formulaire a été ouvert depuis la liste des étudiants
        const fromStudents =
          this.route.snapshot.queryParamMap.get('from') === 'students';

        // Redirige vers la liste des étudiants ou vers la connexion
        this.router.navigate(fromStudents ? ['/students'] : ['/login']);
      },
    );
  }

  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }
}
