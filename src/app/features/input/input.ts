import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AiService } from '../../core/services/ai.service';
import { StudyPlanService } from '../../core/services/study-plan.service';
import { StudyPlan } from '../../core/models/study-plan.model';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <!-- Hero Section with Gradient -->
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <!-- Header -->
      <header class="text-center pt-12 pb-8">
        <h1
          class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3"
        >
          StudyGenius
        </h1>
        <p class="text-gray-600 text-lg">Your AI-powered study companion</p>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 pb-12">
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Left Pane: Create New Plan -->
          <div
            class="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl"
          >
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span
                class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm mr-3"
                >✨</span
              >
              Create New Plan
            </h2>

            <form [formGroup]="form" (ngSubmit)="generatePlan()" class="space-y-6">
              <!-- Resume Input -->
              <div class="form-group">
                <label for="resume" class="block text-sm font-semibold text-gray-700 mb-2">
                  Resume / Skills
                </label>
                <textarea
                  id="resume"
                  formControlName="resume"
                  placeholder="Paste your resume or list your skills here..."
                  rows="5"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 resize-none"
                ></textarea>
              </div>

              <!-- Job Description Input -->
              <div class="form-group">
                <label for="jd" class="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  id="jd"
                  formControlName="jobDescription"
                  placeholder="Paste the job description here..."
                  rows="5"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 resize-none"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="form.invalid || isLoading()"
                class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                @if (isLoading()) {
                <span class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Plan...
                </span>
                } @else {
                <span class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                  Generate Study Plan
                </span>
                }
              </button>
            </form>
          </div>

          <!-- Right Pane: Saved Plans -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 flex items-center">
                <span
                  class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm mr-3"
                  >📚</span
                >
                Saved Plans
              </h2>
              <div class="flex gap-2">
                <button
                  (click)="exportData()"
                  class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200 flex items-center shadow-sm"
                  title="Export Data"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  Export
                </button>
                <button
                  (click)="triggerImport()"
                  class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200 flex items-center shadow-sm"
                  title="Import Data"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    ></path>
                  </svg>
                  Import
                </button>
              </div>
            </div>

            @if (savedPlans().length > 0) {
            <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              @for (plan of savedPlans(); track plan.id) {
              <div
                class="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 border-2 border-transparent hover:border-indigo-200"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900 truncate mb-1">
                      {{ plan.jobDescription | slice : 0 : 40 }}...
                    </h3>
                    <span class="text-xs text-gray-500 flex items-center">
                      <svg
                        class="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      {{ plan.createdAt | date : 'mediumDate' }}
                    </span>
                  </div>
                  <div class="flex gap-2 ml-4">
                    <button
                      (click)="openPlan(plan.id!)"
                      class="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Open
                    </button>
                    <button
                      (click)="deletePlan(plan.id!)"
                      class="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              }
            </div>
            } @else {
            <div class="text-center py-12">
              <div
                class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <p class="text-gray-500 text-sm">No saved plans yet</p>
              <p class="text-gray-400 text-xs mt-1">Create one to get started!</p>
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class InputComponent implements OnInit {
  private fb = inject(FormBuilder);
  private aiService = inject(AiService);
  private router = inject(Router);
  private studyPlanService = inject(StudyPlanService);

  form = this.fb.group({
    resume: ['', Validators.required],
    jobDescription: ['', Validators.required],
  });

  isLoading = signal(false);
  savedPlans = signal<StudyPlan[]>([]);

  ngOnInit() {
    this.loadSavedPlans();
  }

  loadSavedPlans() {
    this.studyPlanService.getAllStudyPlans().subscribe((plans) => {
      this.savedPlans.set(plans);
    });
  }

  generatePlan() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const { resume, jobDescription } = this.form.value;

    this.aiService.generateStudyPlan(resume!, jobDescription!).subscribe(
      (sections) => {
        const studyPlan: StudyPlan = {
          resume: resume!,
          jobDescription: jobDescription!,
          sections,
          createdAt: new Date(),
        };

        this.studyPlanService.createStudyPlan(studyPlan).subscribe((created) => {
          this.isLoading.set(false);
          this.router.navigate(['/plan', created.id]);
        });
      },
      (error) => {
        console.error('Error generating plan:', error);
        this.isLoading.set(false);
      }
    );
  }

  openPlan(id: number) {
    this.router.navigate(['/plan', id]);
  }

  exportData() {
    this.studyPlanService.exportAllData().subscribe((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-genius-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  triggerImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            const data = JSON.parse(re.target?.result as string);
            this.importData(data);
          } catch (err) {
            console.error('Invalid JSON', err);
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  importData(data: any) {
    if (!confirm('Importing will add these plans to your library. Continue?')) return;

    this.isLoading.set(true);
    this.studyPlanService.importAllData(data).subscribe({
      next: () => {
        this.loadSavedPlans();
        this.isLoading.set(false);
        alert('Data imported successfully!');
      },
      error: (err) => {
        console.error('Import failed', err);
        this.isLoading.set(false);
        alert('Import failed: ' + err.message);
      },
    });
  }

  deletePlan(id: number) {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    this.studyPlanService.deleteStudyPlan(id).subscribe(() => {
      this.loadSavedPlans();
    });
  }
}
