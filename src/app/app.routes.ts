import { Routes } from '@angular/router';
import { InputComponent } from './features/input/input';
import { StudyPlanComponent } from './features/study-plan/study-plan';
import { MaterialsComponent } from './features/materials/materials';

export const routes: Routes = [
  { path: '', component: InputComponent },
  { path: 'plan/:id', component: StudyPlanComponent },
  { path: 'materials/:sectionId', component: MaterialsComponent },
];
