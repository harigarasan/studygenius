import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, from, map } from 'rxjs';
import { StudyPlan, SectionMaterials, StudySection } from '../models/study-plan.model';

@Injectable({
  providedIn: 'root',
})
export class StudyPlanService {
  constructor(private dbService: NgxIndexedDBService) {}

  createStudyPlan(plan: StudyPlan): Observable<StudyPlan> {
    return this.dbService.add('studyPlans', plan);
  }

  getAllStudyPlans(): Observable<StudyPlan[]> {
    return this.dbService.getAll('studyPlans');
  }

  getStudyPlanById(id: number): Observable<StudyPlan> {
    return this.dbService.getByKey('studyPlans', id);
  }

  updateStudyPlan(plan: StudyPlan): Observable<StudyPlan> {
    return this.dbService.update('studyPlans', plan);
  }

  deleteStudyPlan(id: number): Observable<any> {
    return this.dbService.delete('studyPlans', id);
  }

  getSectionById(sectionId: string): Observable<StudySection | undefined> {
    return this.getAllStudyPlans().pipe(
      map((plans) => {
        for (const plan of plans) {
          const section = plan.sections.find((s) => s.id === sectionId);
          if (section) return section;
        }
        return undefined;
      })
    );
  }

  // Materials
  saveMaterials(materials: SectionMaterials): Observable<SectionMaterials> {
    return this.dbService.add('sectionMaterials', materials);
  }

  getMaterialsBySectionId(sectionId: string): Observable<SectionMaterials | undefined> {
    // Since sectionId is not the key, we might need to use getAll and filter, or add an index.
    // For simplicity with small data, getAll and find is okay, but index is better.
    // Assuming we added an index or just use getAll for now.
    return this.dbService
      .getAll<SectionMaterials>('sectionMaterials')
      .pipe(map((all) => all.find((m) => m.sectionId === sectionId)));
  }

  updateMaterials(materials: SectionMaterials): Observable<SectionMaterials> {
    return this.dbService.update('sectionMaterials', materials);
  }
}
