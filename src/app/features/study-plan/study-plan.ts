import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudyPlanService } from '../../core/services/study-plan.service';
import {
  StudyPlan,
  InterviewCategory,
  InterviewQuestion,
  StudySection,
} from '../../core/models/study-plan.model';
import { AiService } from '../../core/services/ai.service';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-study-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-gray-100"
      *ngIf="plan(); else loading"
    >
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            (click)="goBack()"
            class="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Home
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Study Plan</h1>
          <div class="w-32"></div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Main Tabs -->
        <div class="bg-white rounded-xl shadow-lg mb-6">
          <div class="flex border-b border-gray-200">
            <button
              (click)="mainTab.set('roadmap')"
              class="flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="mainTab() === 'roadmap'"
              [class.text-indigo-600]="mainTab() === 'roadmap'"
              [class.border-transparent]="mainTab() !== 'roadmap'"
              [class.text-gray-500]="mainTab() !== 'roadmap'"
              [class.hover:text-gray-700]="mainTab() !== 'roadmap'"
            >
              📚 Your Roadmap
            </button>
            <button
              (click)="mainTab.set('interview')"
              class="flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="mainTab() === 'interview'"
              [class.text-indigo-600]="mainTab() === 'interview'"
              [class.border-transparent]="mainTab() !== 'interview'"
              [class.text-gray-500]="mainTab() !== 'interview'"
              [class.hover:text-gray-700]="mainTab() !== 'interview'"
            >
              💼 Interview Prep
            </button>
          </div>
        </div>

        <!-- Roadmap Tab -->
        @if (mainTab() === 'roadmap') {
        <div class="space-y-6">
          <!-- Header Card -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 flex items-center">
                <span
                  class="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white mr-3"
                >
                  🎯
                </span>
                Your Roadmap
              </h2>
              <button
                (click)="regeneratePlan()"
                [disabled]="isRegenerating()"
                class="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-all duration-200 disabled:opacity-50"
              >
                {{ isRegenerating() ? 'Regenerating...' : 'Regenerate Plan' }}
              </button>
            </div>

            <!-- Resume & JD Accordion -->
            <div class="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <button
                (click)="toggleResume()"
                class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
              >
                <span class="font-medium text-gray-700">Resume & Job Description</span>
                <svg
                  class="w-5 h-5 text-gray-500 transform transition-transform duration-200"
                  [class.rotate-180]="showResume()"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              <div
                *ngIf="showResume()"
                class="px-4 py-4 bg-white border-t border-gray-200 space-y-4"
              >
                <div class="flex justify-end mb-2">
                  @if (!isEditingInfo()) {
                  <button
                    (click)="toggleInfoEdit()"
                    class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Edit Info
                  </button>
                  } @else {
                  <div class="flex gap-2">
                    <button
                      (click)="saveInputs()"
                      class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      (click)="cancelInfoEdit()"
                      class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                  }
                </div>

                @if (isEditingInfo()) {
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2"
                    >Resume / Skills</label
                  >
                  <textarea
                    [formControl]="resumeControl"
                    rows="6"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 resize-none"
                    placeholder="Edit your resume..."
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2"
                    >Job Description</label
                  >
                  <textarea
                    [formControl]="jdControl"
                    rows="6"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 resize-none"
                    placeholder="Edit the job description..."
                  ></textarea>
                </div>
                } @else {
                <div>
                  <h4 class="text-sm font-semibold text-gray-700 mb-2">Resume / Skills</h4>
                  <div class="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                    {{ plan()?.resume }}
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-gray-700 mb-2">Job Description</h4>
                  <div class="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                    {{ plan()?.jobDescription }}
                  </div>
                </div>
                }
              </div>
            </div>
          </div>

          <!-- Sections List -->
          <div class="space-y-3">
            <div class="flex justify-end mb-4">
              <button
                (click)="addSection()"
                class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center shadow-sm"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Add Section
              </button>
            </div>

            @for (section of plan()?.sections; track section.id; let i = $index) {
            <div
              class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              @if (editingSectionIndex() === i) {
              <!-- Edit Mode -->
              <div class="px-6 py-4 bg-gray-50 border-l-4 border-indigo-500">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-indigo-600">Editing Section</h3>
                  <div class="flex gap-2">
                    <button
                      (click)="saveSection(i)"
                      class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      (click)="cancelEditSection()"
                      class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                    <input
                      [(ngModel)]="tempSection.title"
                      class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                      placeholder="Section Title"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Goals</label>
                    <textarea
                      [(ngModel)]="tempSection.goals"
                      rows="3"
                      class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
                      placeholder="Section Goals"
                    ></textarea>
                  </div>
                </div>
              </div>
              } @else {
              <!-- View Mode -->
              <div class="flex flex-col">
                <div class="flex items-center justify-between px-6 py-4 bg-white">
                  <button
                    (click)="toggleSection(section.title)"
                    class="flex-1 flex items-center text-left hover:text-indigo-600 transition-colors duration-200"
                  >
                    <h3 class="text-lg font-bold text-gray-900 mr-3">{{ section.title }}</h3>
                    <svg
                      class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                      [class.rotate-180]="expandedSections().has(section.title)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>

                  <div class="flex items-center gap-2 ml-4">
                    <!-- Reorder Buttons -->
                    <div class="flex flex-col mr-2">
                      <button
                        (click)="$event.stopPropagation(); moveSection(i, 'up')"
                        [disabled]="i === 0"
                        class="text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 15l7-7 7 7"
                          ></path>
                        </svg>
                      </button>
                      <button
                        (click)="$event.stopPropagation(); moveSection(i, 'down')"
                        [disabled]="i === (plan()?.sections?.length || 0) - 1"
                        class="text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    <!-- Actions -->
                    <button
                      (click)="$event.stopPropagation(); editSection(i, section)"
                      class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      title="Edit Section"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      (click)="$event.stopPropagation(); deleteSection(i)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Section"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  *ngIf="expandedSections().has(section.title)"
                  class="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200"
                >
                  <p class="text-gray-700 mb-4">{{ section.goals }}</p>
                  <button
                    (click)="openMaterials(section.id!)"
                    class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      ></path>
                    </svg>
                    View Materials
                  </button>
                </div>
              </div>
              }
            </div>
            }
          </div>
        </div>
        }

        <!-- Interview Prep Tab -->
        @if (mainTab() === 'interview') {
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span
              class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mr-3"
            >
              💼
            </span>
            Interview Prep
          </h2>

          <!-- Question Category Tabs -->
          <div class="flex space-x-2 mb-6 border-b border-gray-200">
            <button
              (click)="setActiveTab('Technical')"
              class="px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="activeTab() === 'Technical'"
              [class.text-indigo-600]="activeTab() === 'Technical'"
              [class.border-transparent]="activeTab() !== 'Technical'"
              [class.text-gray-500]="activeTab() !== 'Technical'"
            >
              Technical
            </button>
            <button
              (click)="setActiveTab('System Design')"
              class="px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="activeTab() === 'System Design'"
              [class.text-indigo-600]="activeTab() === 'System Design'"
              [class.border-transparent]="activeTab() !== 'System Design'"
              [class.text-gray-500]="activeTab() !== 'System Design'"
            >
              System Design
            </button>
            <button
              (click)="setActiveTab('Behavioral')"
              class="px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="activeTab() === 'Behavioral'"
              [class.text-indigo-600]="activeTab() === 'Behavioral'"
              [class.border-transparent]="activeTab() !== 'Behavioral'"
              [class.text-gray-500]="activeTab() !== 'Behavioral'"
            >
              Behavioral
            </button>
          </div>

          <!-- Tab Controls -->
          <div class="flex gap-2 mb-6">
            <button
              (click)="addQuestion()"
              class="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm"
            >
              Add Question
            </button>
            <button
              (click)="generateQuestions()"
              [disabled]="isGeneratingQuestions()"
              class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 text-sm"
            >
              {{
                isGeneratingQuestions() ? 'Generating...' : 'Generate ' + activeTab() + ' Questions'
              }}
            </button>
          </div>

          <!-- Questions Accordion List -->
          <div class="space-y-3">
            @for (q of filteredQuestions(); track $index) {
            <div
              class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              @if (editingQuestionIndex() === $index) {
              <!-- Edit Mode -->
              <div class="px-6 py-4 bg-gray-50">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-bold text-indigo-600">Editing Q{{ $index + 1 }}</span>
                  <div class="flex gap-2">
                    <button
                      (click)="saveQuestion($index)"
                      class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      (click)="cancelEditQuestion()"
                      class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Question</label>
                    <input
                      [(ngModel)]="tempQuestion.question"
                      class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                      placeholder="Enter your question..."
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Answer</label>
                    <textarea
                      [(ngModel)]="tempQuestion.answer"
                      class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
                      rows="6"
                      placeholder="Enter the ideal answer..."
                    ></textarea>
                  </div>
                </div>
              </div>
              } @else {
              <!-- View Mode -->
              <button
                (click)="toggleQuestion($index)"
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center flex-1 text-left">
                  <span class="text-sm font-bold text-indigo-600 mr-3">Q{{ $index + 1 }}</span>
                  <h3 class="text-base font-semibold text-gray-900">{{ q.question }}</h3>
                </div>
                <div class="flex items-center gap-3 ml-4">
                  <button
                    (click)="$event.stopPropagation(); editQuestion($index, q)"
                    class="text-indigo-600 hover:text-indigo-700 text-lg"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    (click)="$event.stopPropagation(); deleteQuestion($index)"
                    class="text-red-600 hover:text-red-700 text-lg"
                    title="Delete"
                  >
                    🗑
                  </button>
                  <svg
                    class="w-5 h-5 text-gray-500 transform transition-transform duration-200"
                    [class.rotate-180]="expandedQuestions().has($index)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </button>

              <div
                *ngIf="expandedQuestions().has($index)"
                class="px-6 py-6 bg-gradient-to-br from-indigo-50 to-white border-t border-gray-200"
              >
                <div class="flex items-center mb-4">
                  <span class="text-xl mr-2">💡</span>
                  <p class="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                    Ideal Answer
                  </p>
                </div>
                <div class="bg-white rounded-xl p-6 border-l-4 border-indigo-500 shadow-sm">
                  <div class="prose prose-base max-w-none">
                    <div
                      class="text-gray-800 leading-relaxed space-y-3"
                      style="white-space: pre-line; word-wrap: break-word; line-height: 1.8;"
                      [innerHTML]="formatAnswerText(q.answer)"
                    ></div>
                  </div>
                </div>
              </div>
              }
            </div>
            } @if (filteredQuestions().length === 0) {
            <div class="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
              <svg
                class="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p class="text-gray-500 text-sm">No {{ activeTab() }} questions yet</p>
              <p class="text-gray-400 text-xs mt-1">
                Click "Add Question" or "Generate" to get started
              </p>
            </div>
            }
          </div>
        </div>
        }
      </div>
    </div>

    <ng-template #loading>
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <svg
            class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
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
          <p class="text-gray-600">Loading study plan...</p>
        </div>
      </div>
    </ng-template>
  `,
  styles: [],
})
export class StudyPlanComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studyPlanService = inject(StudyPlanService);
  private aiService = inject(AiService);

  plan = signal<StudyPlan | undefined>(undefined);
  expandedSections = signal<Set<string>>(new Set());
  expandedQuestions = signal<Set<number>>(new Set()); // Track expanded questions

  // Main tab state
  mainTab = signal<'roadmap' | 'interview'>('roadmap');

  // Resume/JD Edit State
  showResume = signal(false);
  isEditingInfo = signal(false);
  isRegenerating = signal(false);
  resumeControl = new FormControl('');
  jdControl = new FormControl('');

  // Interview Q&A State
  activeTab = signal<InterviewCategory>('Technical');
  isGeneratingQuestions = signal(false);
  editingQuestionIndex = signal<number | null>(null);
  tempQuestion: any = {};

  // Computed for filtered questions
  filteredQuestions = computed(() => {
    const allQuestions = this.plan()?.interviewQuestions || [];
    return allQuestions.filter((q) => q.category === this.activeTab());
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadPlan(id);
      }
    });
  }

  loadPlan(id: number) {
    this.studyPlanService.getStudyPlanById(id).subscribe((plan) => {
      this.plan.set(plan);
      if (plan) {
        this.resumeControl.setValue(plan.resume);
        this.jdControl.setValue(plan.jobDescription);
      }
    });
  }

  toggleSection(title: string) {
    this.expandedSections.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(title)) newSet.delete(title);
      else newSet.add(title);
      return newSet;
    });
  }

  toggleQuestion(index: number) {
    this.expandedQuestions.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }

  toggleResume() {
    this.showResume.update((v) => !v);
  }

  toggleInfoEdit() {
    this.isEditingInfo.set(true);
    // Reset controls to current plan values
    const plan = this.plan();
    if (plan) {
      this.resumeControl.setValue(plan.resume);
      this.jdControl.setValue(plan.jobDescription);
    }
  }

  cancelInfoEdit() {
    this.isEditingInfo.set(false);
  }

  saveInputs() {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const updatedPlan: StudyPlan = {
      ...currentPlan,
      resume: this.resumeControl.value || currentPlan.resume,
      jobDescription: this.jdControl.value || currentPlan.jobDescription,
    };

    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
      this.isEditingInfo.set(false);
    });
  }

  regeneratePlan() {
    if (!this.plan()) return;
    this.isRegenerating.set(true);

    const currentPlan = this.plan()!;
    const resume = this.resumeControl.value || currentPlan.resume;
    const jobDescription = this.jdControl.value || currentPlan.jobDescription;

    this.aiService.generateStudyPlan(resume, jobDescription).subscribe((newSections) => {
      const updatedPlan: StudyPlan = {
        ...currentPlan,
        resume,
        jobDescription,
        sections: newSections,
      };

      this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
        this.plan.set(saved);
        this.isRegenerating.set(false);
        this.expandedSections.set(new Set());
      });
    });
  }

  openMaterials(sectionId: string) {
    this.router.navigate(['/materials', sectionId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // --- Interview Questions Logic ---

  setActiveTab(tab: InterviewCategory) {
    this.activeTab.set(tab);
    this.cancelEditQuestion();
    this.expandedQuestions.set(new Set()); // Collapse all when switching tabs
  }

  generateQuestions() {
    if (!this.plan()) return;
    this.isGeneratingQuestions.set(true);

    const { resume, jobDescription } = this.plan()!;
    const category = this.activeTab();

    this.aiService
      .generateInterviewQuestions(resume, jobDescription, category)
      .subscribe((questions) => {
        const currentPlan = this.plan()!;
        const existing = currentPlan.interviewQuestions || [];

        const updatedPlan = {
          ...currentPlan,
          interviewQuestions: [...existing, ...questions],
        };

        this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
          this.plan.set(saved);
          this.isGeneratingQuestions.set(false);
        });
      });
  }

  addQuestion() {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const questions = currentPlan.interviewQuestions || [];
    const newQ: InterviewQuestion = {
      question: 'New Question',
      answer: 'Ideal Answer',
      category: this.activeTab(),
    };
    const updatedPlan = { ...currentPlan, interviewQuestions: [newQ, ...questions] };

    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
      this.editQuestion(0, newQ);
    });
  }

  editQuestion(index: number, q: any) {
    this.editingQuestionIndex.set(index);
    this.tempQuestion = { ...q };
  }

  cancelEditQuestion() {
    this.editingQuestionIndex.set(null);
  }

  saveQuestion(index: number) {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const filtered = this.filteredQuestions();
    const questionToUpdate = filtered[index];

    const allQuestions = [...(currentPlan.interviewQuestions || [])];
    const realIndex = allQuestions.indexOf(questionToUpdate);

    if (realIndex === -1) return;

    allQuestions[realIndex] = { ...this.tempQuestion, category: this.activeTab() };

    const updatedPlan = { ...currentPlan, interviewQuestions: allQuestions };
    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
      this.editingQuestionIndex.set(null);
    });
  }

  deleteQuestion(index: number) {
    if (!confirm('Delete this question?')) return;
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const filtered = this.filteredQuestions();
    const questionToDelete = filtered[index];

    const allQuestions = [...(currentPlan.interviewQuestions || [])];
    const realIndex = allQuestions.indexOf(questionToDelete);

    if (realIndex === -1) return;

    allQuestions.splice(realIndex, 1);

    const updatedPlan = { ...currentPlan, interviewQuestions: allQuestions };
    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
    });
  }

  // Roadmap CRUD/Reorder State
  editingSectionIndex = signal<number | null>(null);
  tempSection: Partial<StudySection> = {};

  addSection() {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const newSection: StudySection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      goals: 'Describe the goals for this section...',
      requiredSkills: [],
      tasks: [],
      estimatedHours: 1,
      resources: [],
    };

    const updatedPlan = {
      ...currentPlan,
      sections: [...currentPlan.sections, newSection],
    };

    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
      this.editSection(saved.sections.length - 1, newSection);
    });
  }

  editSection(index: number, section: StudySection) {
    this.editingSectionIndex.set(index);
    this.tempSection = JSON.parse(JSON.stringify(section)); // Deep copy
  }

  cancelEditSection() {
    this.editingSectionIndex.set(null);
    this.tempSection = {};
  }

  saveSection(index: number) {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const sections = [...currentPlan.sections];
    if (index < 0 || index >= sections.length) return;

    sections[index] = { ...sections[index], ...this.tempSection } as StudySection;

    const updatedPlan = { ...currentPlan, sections };

    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
      this.editingSectionIndex.set(null);
    });
  }

  deleteSection(index: number) {
    if (!confirm('Are you sure you want to delete this section?')) return;
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const sections = [...currentPlan.sections];
    sections.splice(index, 1);

    const updatedPlan = { ...currentPlan, sections };

    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
    });
  }

  moveSection(index: number, direction: 'up' | 'down') {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const sections = [...currentPlan.sections];
    if (direction === 'up') {
      if (index === 0) return;
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else {
      if (index === sections.length - 1) return;
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }

    const updatedPlan = { ...currentPlan, sections };

    this.studyPlanService.updateStudyPlan(updatedPlan).subscribe((saved) => {
      this.plan.set(saved);
    });
  }

  // Format answer text for better display
  formatAnswerText(text: string): string {
    if (!text) return '';
    // Replace double newlines with paragraph breaks and single newlines with br
    return text
      .split('\n\n')
      .map((paragraph) => `<p class="mb-3">${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
}
