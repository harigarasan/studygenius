import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, from, map, forkJoin } from 'rxjs';
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

  exportAllData(): Observable<{ studyPlans: StudyPlan[]; sectionMaterials: SectionMaterials[] }> {
    return forkJoin({
      studyPlans: this.dbService.getAll<StudyPlan>('studyPlans'),
      sectionMaterials: this.dbService.getAll<SectionMaterials>('sectionMaterials'),
    });
  }

  importAllData(data: {
    studyPlans: StudyPlan[];
    sectionMaterials: SectionMaterials[];
  }): Observable<any> {
    const { studyPlans, sectionMaterials } = data;

    // Using bulkAdd for performance.
    // We strip IDs to ensure we don't conflict with existing data and allow "import as copy".
    // If the user wants to restore exact state, they should clear first (which we could offer).
    // For now, we'll assume "Import" means "Add these to my library".

    const plansWithoutIds = studyPlans.map(({ id, ...rest }) => rest);
    const materialsWithoutIds = sectionMaterials.map(({ id, ...rest }) => rest);

    return forkJoin([
      plansWithoutIds.length ? this.dbService.bulkAdd('studyPlans', plansWithoutIds) : from([[]]),
      materialsWithoutIds.length
        ? this.dbService.bulkAdd('sectionMaterials', materialsWithoutIds)
        : from([[]]),
    ]);
  }
}
