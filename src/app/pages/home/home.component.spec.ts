import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    // Configuration de l'environnement de test Angular.
    await TestBed.configureTestingModule({
      imports: [HomeComponent],

      // Fournit les dépendances du routeur nécessaires
      // au fonctionnement de RouterLink dans le template.
      providers: [provideRouter([])]
    })
    .compileComponents();

    // Création d'une instance du composant.
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Déclenche le cycle de détection des changements.
    fixture.detectChanges();
  });

  // Vérifie que le composant peut être instancié.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});