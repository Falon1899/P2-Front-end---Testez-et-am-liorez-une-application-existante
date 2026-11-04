
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Students';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private router = inject(Router);

  // Contiendra les informations de l'étudiant sélectionné
  student: Student | null = null;

  ngOnInit(): void {

    // Récupère l'identifiant présent dans l'URL
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Vérifie que l'identifiant est valide
    if (!Number.isInteger(id) || id <= 0) {
      console.error('Identifiant étudiant invalide');
      return;
    }

    // Demande les informations de l'étudiant au backend
    this.userService.getStudentById(id).subscribe({
      next: (data) => {
        this.student = data;
        console.log('Étudiant récupéré :', data);
      },
      error: (error) => {
        console.error('Erreur de récupération de l’étudiant :', error);
      }
    });
  }

  // Supprime l'étudiant après confirmation
  deleteStudent(): void {

    // Vérifie qu'un étudiant est chargé
    if (!this.student) {
      return;
    }

    // Demande confirmation avant toute suppression
    const confirmation = confirm(
      `Voulez-vous vraiment supprimer ${this.student.firstName} ${this.student.lastName} ?`
    );

    // Annule la suppression si l'utilisateur refuse
    if (!confirmation) {
      return;
    }

    // Envoie la demande de suppression au backend
    this.userService.deleteStudent(this.student.id).subscribe({
      next: () => {
        alert('Étudiant supprimé avec succès !');

        // Retourne à la liste des étudiants
        this.router.navigate(['/students']);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression :', error);
        alert("Impossible de supprimer l'étudiant.");
      }
    });
  }
}
