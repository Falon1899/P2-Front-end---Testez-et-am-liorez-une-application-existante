
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Students';
import { RouterLink } from '@angular/router';

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
}
