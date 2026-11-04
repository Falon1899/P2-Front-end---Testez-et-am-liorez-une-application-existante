
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './student-edit.component.html',
  styleUrl: './student-edit.component.css'
})
export class StudentEditComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private fb = new FormBuilder().nonNullable;

  studentId = 0;
  errorMessage = '';

  // Formulaire contenant les informations modifiables
  editForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    login: ['', Validators.required]
  });

  ngOnInit(): void {
    // Récupère l'identifiant depuis l'URL
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.studentId) || this.studentId <= 0) {
      this.errorMessage = 'Identifiant étudiant invalide.';
      return;
    }

    // Récupère les informations actuelles de l'étudiant
    this.userService.getStudentById(this.studentId).subscribe({
      next: (student) => {
        // Préremplit les champs avec les données reçues
        this.editForm.patchValue({
          firstName: student.firstName,
          lastName: student.lastName,
          login: student.login
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de récupérer cet étudiant.';
      }
    });
  }
  // Enregistre les modifications de l'étudiant
  onSubmit(): void {

    // Empêche l'envoi si le formulaire est invalide
    if (this.editForm.invalid || this.studentId <= 0) {
      return;
    }

    // Récupère les nouvelles valeurs du formulaire
    const updatedStudent = this.editForm.getRawValue();

    // Envoie les modifications au backend
    this.userService.updateStudent(this.studentId, updatedStudent).subscribe({
      next: () => {
        alert('Étudiant modifié avec succès !');

        // Retourne sur la fiche de l'étudiant
        this.router.navigate(['/students', this.studentId]);
      },
      error: (error) => {
        console.error('Erreur de modification :', error);
        this.errorMessage = 'Impossible de modifier cet étudiant.';
      }
    });
  }
}
