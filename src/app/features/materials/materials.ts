import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudyPlanService } from '../../core/services/study-plan.service';
import { AiService } from '../../core/services/ai.service';
import {
  SectionMaterials,
  Slide,
  Flashcard,
  QuizQuestion,
  StudySection,
} from '../../core/models/study-plan.model';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-gray-100"
      *ngIf="section(); else loading"
    >
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <button
            (click)="goBack()"
            class="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-3"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Plan
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Study Materials: {{ section()?.title }}</h1>
        </div>
      </header>

      <!-- Tabs -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex space-x-8">
            <button
              [class.active]="activeTab() === 'slides'"
              (click)="activeTab.set('slides')"
              class="px-4 py-4 font-semibold text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="activeTab() === 'slides'"
              [class.text-indigo-600]="activeTab() === 'slides'"
              [class.border-transparent]="activeTab() !== 'slides'"
              [class.text-gray-500]="activeTab() !== 'slides'"
              [class.hover:text-gray-700]="activeTab() !== 'slides'"
            >
              📊 Slides
            </button>
            <button
              [class.active]="activeTab() === 'flashcards'"
              (click)="activeTab.set('flashcards')"
              class="px-4 py-4 font-semibold text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="activeTab() === 'flashcards'"
              [class.text-indigo-600]="activeTab() === 'flashcards'"
              [class.border-transparent]="activeTab() !== 'flashcards'"
              [class.text-gray-500]="activeTab() !== 'flashcards'"
              [class.hover:text-gray-700]="activeTab() !== 'flashcards'"
            >
              🗂️ Flashcards
            </button>
            <button
              [class.active]="activeTab() === 'quiz'"
              (click)="activeTab.set('quiz')"
              class="px-4 py-4 font-semibold text-sm transition-all duration-200 border-b-2"
              [class.border-indigo-600]="activeTab() === 'quiz'"
              [class.text-indigo-600]="activeTab() === 'quiz'"
              [class.border-transparent]="activeTab() !== 'quiz'"
              [class.text-gray-500]="activeTab() !== 'quiz'"
              [class.hover:text-gray-700]="activeTab() !== 'quiz'"
            >
              ✅ Quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- SLIDES TAB -->
        @if (activeTab() === 'slides') {
        <div class="space-y-6">
          <!-- Subsections Header -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Subsections</h2>
              <button
                (click)="generateSubsections()"
                [disabled]="isLoading()"
                class="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
              >
                {{ isLoading() ? 'Generating...' : 'Generate Subsections' }}
              </button>
            </div>
          </div>

          <!-- Subsections Accordion -->
          @if (materials()?.subsections; as subsections) {
          <div class="space-y-3">
            @for (sub of subsections; track sub.title) {
            <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <button
                (click)="toggleSubsection(sub.title)"
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 class="text-lg font-bold text-gray-900 text-left">{{ sub.title }}</h3>
                <svg
                  class="w-5 h-5 text-gray-500 transform transition-transform duration-200"
                  [class.rotate-180]="expandedSubsections().has(sub.title)"
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

              @if (expandedSubsections().has(sub.title)) {
              <div
                class="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200"
              >
                <!-- Subsection Controls -->
                <div class="flex gap-3 mb-4">
                  <button
                    (click)="addSlide(sub.title)"
                    class="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm"
                  >
                    Add Slide
                  </button>
                  <button
                    (click)="generateSlidesForSubsection(sub.title)"
                    [disabled]="isLoading()"
                    class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 text-sm"
                  >
                    Regenerate
                  </button>
                </div>

                <!-- Slides for this subsection -->
                @let subSlides = getSlidesForSubsection(sub.title); @if (subSlides.length > 0) {
                <div class="space-y-3">
                  @for (slide of subSlides; track slide) { @let globalIndex =
                  materials()?.slides?.indexOf(slide);
                  <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div class="flex items-start justify-between mb-3">
                      @if (editingSlideIndex() === globalIndex) {
                      <input
                        [(ngModel)]="tempSlide.title"
                        class="flex-1 px-3 py-2 border-2 border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none font-semibold"
                        placeholder="Slide Title"
                      />
                      } @else {
                      <h4 class="font-semibold text-gray-900">{{ slide.title }}</h4>
                      }
                      <div class="flex gap-2 ml-4">
                        @if (editingSlideIndex() === globalIndex) {
                        <button
                          (click)="saveSlide()"
                          class="text-emerald-600 hover:text-emerald-700 text-lg"
                        >
                          ✓
                        </button>
                        <button
                          (click)="cancelEditSlide()"
                          class="text-red-600 hover:text-red-700 text-lg"
                        >
                          ✕
                        </button>
                        } @else {
                        <button
                          (click)="editSlide(slide)"
                          class="text-indigo-600 hover:text-indigo-700 text-lg"
                        >
                          ✎
                        </button>
                        <button
                          (click)="deleteSlide(slide)"
                          class="text-red-600 hover:text-red-700 text-lg"
                        >
                          🗑
                        </button>
                        }
                      </div>
                    </div>

                    @if (editingSlideIndex() === globalIndex) {
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1"
                          >Bullet Points (one per line)</label
                        >
                        <textarea
                          [(ngModel)]="tempBullets"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-sm"
                          placeholder="Point 1&#10;Point 2&#10;Point 3"
                        ></textarea>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1"
                          >Content/Notes</label
                        >
                        <textarea
                          [(ngModel)]="tempSlide.content"
                          rows="4"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-sm"
                          placeholder="Detailed content and speaker notes..."
                        ></textarea>
                      </div>
                    </div>
                    } @else {
                    <div class="space-y-2">
                      @if (slide.bulletPoints && slide.bulletPoints.length > 0) {
                      <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
                        @for (point of slide.bulletPoints; track $index) {
                        <li>{{ point }}</li>
                        }
                      </ul>
                      } @if (slide.content) {
                      <p class="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
                        {{ slide.content }}
                      </p>
                      }
                    </div>
                    }
                  </div>
                  }
                </div>
                } @else {
                <div class="text-center py-8 text-gray-500 text-sm">
                  No slides for this subsection yet. Click "Add Slide" or "Regenerate".
                </div>
                }
              </div>
              }
            </div>
            }
          </div>
          } @else {
          <div class="bg-white rounded-xl shadow-lg p-12 text-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <p class="text-gray-500">No subsections yet. Generate them to get started!</p>
          </div>
          }
        </div>
        }

        <!-- FLASHCARDS TAB -->
        @if (activeTab() === 'flashcards') {
        <div class="space-y-6">
          <!-- Header -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Flashcards</h2>
              <div class="flex gap-3">
                <button
                  (click)="addFlashcard()"
                  class="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                >
                  Add Flashcard
                </button>
                <button
                  (click)="generateFlashcards()"
                  [disabled]="isLoading()"
                  class="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {{ isLoading() ? 'Generating...' : 'Generate Flashcards' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Flashcards Grid -->
          @if (materials()?.flashcards && materials()!.flashcards!.length > 0) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (card of materials()!.flashcards!; track $index) {
            <div class="relative h-48 cursor-pointer perspective-1000" (click)="flipCard($index)">
              <div
                class="absolute w-full h-full transition-transform duration-500 transform-style-3d"
                [class.rotate-y-180]="flippedCards().has($index)"
              >
                <!-- Front -->
                <div
                  class="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 flex flex-col"
                >
                  <div class="flex justify-between items-start mb-auto">
                    <span class="text-xs font-bold text-white/80">Q{{ $index + 1 }}</span>
                    <div class="flex gap-2">
                      <button
                        (click)="$event.stopPropagation(); editFlashcard($index, card)"
                        class="text-white/90 hover:text-white text-sm"
                      >
                        ✎
                      </button>
                      <button
                        (click)="$event.stopPropagation(); deleteFlashcard($index)"
                        class="text-white/90 hover:text-white text-sm"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  @if (editingFlashcardIndex() === $index) {
                  <textarea
                    [(ngModel)]="tempFlashcard.question"
                    (click)="$event.stopPropagation()"
                    rows="3"
                    class="w-full px-3 py-2 bg-white/20 text-white placeholder-white/60 rounded-lg focus:bg-white/30 outline-none resize-none text-sm"
                    placeholder="Question..."
                  ></textarea>
                  } @else {
                  <p
                    class="text-white font-semibold text-center flex-1 flex items-center justify-center"
                  >
                    {{ card.question }}
                  </p>
                  } @if (editingFlashcardIndex() === $index) {
                  <div class="flex gap-2 mt-2">
                    <button
                      (click)="$event.stopPropagation(); saveFlashcard($index)"
                      class="flex-1 px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      (click)="$event.stopPropagation(); cancelEditFlashcard()"
                      class="flex-1 px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  } @else {
                  <p class="text-white/70 text-xs text-center mt-auto">Click to flip</p>
                  }
                </div>
                <!-- Back -->
                <div
                  class="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 flex items-center justify-center rotate-y-180"
                >
                  @if (editingFlashcardIndex() === $index) {
                  <textarea
                    [(ngModel)]="tempFlashcard.answer"
                    (click)="$event.stopPropagation()"
                    rows="5"
                    class="w-full px-3 py-2 border-2 border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-sm"
                    placeholder="Answer..."
                  ></textarea>
                  } @else {
                  <p class="text-gray-700 text-center">{{ card.answer }}</p>
                  }
                </div>
              </div>
            </div>
            }
          </div>
          } @else {
          <div class="bg-white rounded-xl shadow-lg p-12 text-center">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            <p class="text-gray-500">No flashcards yet. Add one or generate them!</p>
          </div>
          }
        </div>
        }

        <!-- QUIZ TAB -->
        @if (activeTab() === 'quiz') {
        <div class="space-y-6">
          <!-- Header -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Quiz</h2>
              <div class="flex gap-3">
                @if (!quizSubmitted()) {
                <button
                  (click)="addQuizQuestion()"
                  class="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                >
                  Add Question
                </button>
                <button
                  (click)="generateQuiz()"
                  [disabled]="isLoading()"
                  class="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {{ isLoading() ? 'Generating...' : 'Generate Quiz' }}
                </button>
                }
              </div>
            </div>
          </div>

          <!-- Quiz Questions -->
          @if (materials()?.quiz && materials()!.quiz!.length > 0) {
          <div class="space-y-4">
            @for (q of materials()!.quiz!; track $index) {
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                @if (editingQuizIndex() === $index) {
                <input
                  [(ngModel)]="tempQuiz.question"
                  class="flex-1 px-3 py-2 border-2 border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none font-semibold"
                  placeholder="Question..."
                />
                } @else {
                <h3 class="font-semibold text-gray-900 flex-1">
                  <span class="text-indigo-600 mr-2">Q{{ $index + 1 }}.</span>
                  {{ q.question }}
                </h3>
                } @if (!quizSubmitted()) {
                <div class="flex gap-2 ml-4">
                  @if (editingQuizIndex() === $index) {
                  <button
                    (click)="saveQuiz($index)"
                    class="text-emerald-600 hover:text-emerald-700 text-lg"
                  >
                    ✓
                  </button>
                  <button
                    (click)="cancelEditQuiz()"
                    class="text-red-600 hover:text-red-700 text-lg"
                  >
                    ✕
                  </button>
                  } @else {
                  <button
                    (click)="editQuiz($index, q)"
                    class="text-indigo-600 hover:text-indigo-700 text-lg"
                  >
                    ✎
                  </button>
                  <button
                    (click)="deleteQuiz($index)"
                    class="text-red-600 hover:text-red-700 text-lg"
                  >
                    🗑
                  </button>
                  }
                </div>
                }
              </div>

              @if (editingQuizIndex() === $index) {
              <div class="space-y-3">
                @for (opt of tempQuizOptions; track $index; let i = $index) {
                <div class="flex items-center gap-2">
                  <input
                    type="radio"
                    [checked]="tempQuiz.correctAnswerIndex === i"
                    (change)="tempQuiz.correctAnswerIndex = i"
                    class="w-4 h-4 text-indigo-600"
                  />
                  <input
                    [(ngModel)]="tempQuizOptions[i]"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                    placeholder="Option {{ i + 1 }}"
                  />
                </div>
                }
                <p class="text-xs text-gray-500">Select the correct answer with the radio button</p>
              </div>
              } @else {
              <div class="space-y-2">
                @for (option of q.options; track $index; let optIdx = $index) {
                <button
                  (click)="!quizSubmitted() && selectAnswer($index, optIdx)"
                  [disabled]="quizSubmitted()"
                  class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200"
                  [class.border-gray-200]="!quizSubmitted() && userAnswers()[$index] !== optIdx"
                  [class.bg-gray-50]="!quizSubmitted() && userAnswers()[$index] !== optIdx"
                  [class.border-indigo-500]="!quizSubmitted() && userAnswers()[$index] === optIdx"
                  [class.bg-indigo-50]="!quizSubmitted() && userAnswers()[$index] === optIdx"
                  [class.border-emerald-500]="quizSubmitted() && optIdx === q.correctAnswerIndex"
                  [class.bg-emerald-50]="quizSubmitted() && optIdx === q.correctAnswerIndex"
                  [class.border-red-500]="
                    quizSubmitted() &&
                    userAnswers()[$index] === optIdx &&
                    optIdx !== q.correctAnswerIndex
                  "
                  [class.bg-red-50]="
                    quizSubmitted() &&
                    userAnswers()[$index] === optIdx &&
                    optIdx !== q.correctAnswerIndex
                  "
                >
                  <div class="flex items-center justify-between">
                    <span class="flex-1">{{ option }}</span>
                    @if (quizSubmitted() && optIdx === q.correctAnswerIndex) {
                    <span class="text-emerald-600 font-bold ml-2">✓</span>
                    } @if (quizSubmitted()) { @if (userAnswers()[$index] === optIdx && optIdx !==
                    q.correctAnswerIndex) {
                    <span class="text-red-600 font-bold ml-2">✗</span>
                    } }
                  </div>
                </button>
                }
              </div>
              }
            </div>
            }
          </div>

          <!-- Quiz Actions -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            @if (!quizSubmitted()) {
            <button
              (click)="submitQuiz()"
              class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-200"
            >
              Submit Quiz
            </button>
            } @else {
            <div class="text-center">
              <div
                class="inline-block px-8 py-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl mb-4"
              >
                <p class="text-3xl font-bold text-indigo-600">{{ calculateScore() }}%</p>
                <p class="text-sm text-gray-600 mt-1">Your Score</p>
              </div>
              <button
                (click)="resetQuiz()"
                class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
            }
          </div>
          } @else {
          <div class="bg-white rounded-xl shadow-lg p-12 text-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              ></path>
            </svg>
            <p class="text-gray-500">No quiz questions yet. Add one or generate them!</p>
          </div>
          }
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
          <p class="text-gray-600">Loading materials...</p>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .perspective-1000 {
        perspective: 1000px;
      }
      .transform-style-3d {
        transform-style: preserve-3d;
      }
      .backface-hidden {
        backface-visibility: hidden;
      }
      .rotate-y-180 {
        transform: rotateY(180deg);
      }
    `,
  ],
})
export class MaterialsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studyPlanService = inject(StudyPlanService);
  private aiService = inject(AiService);

  sectionId = signal<string>('');
  section = signal<StudySection | undefined>(undefined);
  materials = signal<SectionMaterials | undefined>(undefined);

  activeTab = signal<'slides' | 'flashcards' | 'quiz'>('slides');
  isLoading = signal(false);

  // Slides state
  expandedSubsections = signal<Set<string>>(new Set());
  editingSlideIndex = signal<number | null>(null);
  tempSlide: Slide = { title: '', bulletPoints: [], content: '', subsectionTitle: '' };
  tempBullets = '';

  // Flashcards state
  flippedCards = signal<Set<number>>(new Set());
  editingFlashcardIndex = signal<number | null>(null);
  tempFlashcard: Flashcard = { question: '', answer: '' };

  // Quiz state
  editingQuizIndex = signal<number | null>(null);
  tempQuiz: QuizQuestion = { question: '', options: [], correctAnswerIndex: 0 };
  tempQuizOptions: string[] = ['', '', '', ''];
  userAnswers = signal<Record<number, number>>({});
  quizSubmitted = signal(false);

  constructor() {
    console.log('MaterialsComponent constructed');
  }

  ngOnInit() {
    console.log('MaterialsComponent ngOnInit called');
    this.route.paramMap.subscribe((params) => {
      console.log('Route params:', params);
      const id = params.get('sectionId'); // Changed from 'id' to 'sectionId'
      console.log('Section ID from route:', id);
      if (id) {
        this.sectionId.set(id);
        this.loadSection(id);
        this.loadMaterials(id);
      } else {
        console.error('No section ID in route parameters');
      }
    });
  }

  loadSection(id: string) {
    console.log('Loading section with ID:', id);
    this.studyPlanService.getSectionById(id).subscribe((sec) => {
      console.log('Section loaded:', sec);
      if (!sec) {
        console.error('Section not found for ID:', id);
        // Navigate back to home if section not found
        this.router.navigate(['/']);
        return;
      }
      this.section.set(sec);
    });
  }

  loadMaterials(sectionId: string) {
    this.studyPlanService.getMaterialsBySectionId(sectionId).subscribe((mat) => {
      // If no materials exist, initialize empty object
      if (!mat) {
        const emptyMaterials: SectionMaterials = {
          sectionId,
          subsections: [],
          slides: [],
          flashcards: [],
          quiz: [],
        };
        this.materials.set(emptyMaterials);
      } else {
        this.materials.set(mat);
      }
    });
  }

  saveMaterials(updatedMaterials: SectionMaterials) {
    this.studyPlanService.updateMaterials(updatedMaterials).subscribe((saved) => {
      this.materials.set(saved);
    });
  }

  // --- SUBSECTIONS & SLIDES ---

  toggleSubsection(title: string) {
    this.expandedSubsections.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(title)) newSet.delete(title);
      else newSet.add(title);
      return newSet;
    });
  }

  getSlidesForSubsection(title: string): Slide[] {
    return (this.materials()?.slides || []).filter((s) => s.subsectionTitle === title);
  }

  generateSubsections() {
    const sec = this.section();
    if (!sec) return;
    this.isLoading.set(true);

    this.aiService.generateSubsections(sec).subscribe((subs) => {
      const updated = { ...this.materials(), subsections: subs };
      this.saveMaterials(updated as SectionMaterials);
      this.isLoading.set(false);
    });
  }

  generateSlidesForSubsection(subsectionTitle: string) {
    const sec = this.section();
    if (!sec) return;
    this.isLoading.set(true);

    this.aiService.generateSlides(sec, subsectionTitle).subscribe((newSlides) => {
      const existingSlides = this.materials()?.slides || [];
      const otherSlides = existingSlides.filter((s) => s.subsectionTitle !== subsectionTitle);
      const updated = { ...this.materials(), slides: [...otherSlides, ...newSlides] };
      this.saveMaterials(updated as SectionMaterials);
      this.isLoading.set(false);
    });
  }

  generateSlides() {
    const sec = this.section();
    if (!sec) return;
    this.isLoading.set(true);

    this.aiService.generateSlides(sec).subscribe((slides) => {
      const updated = { ...this.materials(), slides };
      this.saveMaterials(updated as SectionMaterials);
      this.isLoading.set(false);
    });
  }

  addSlide(subsectionTitle?: string) {
    const mats = this.materials();
    if (!mats) return;

    const newSlide: Slide = {
      title: 'New Slide',
      bulletPoints: [],
      content: '',
      subsectionTitle: subsectionTitle || '',
    };
    const slides = [...(mats.slides || []), newSlide];
    const updated = { ...mats, slides };
    this.saveMaterials(updated);
    setTimeout(() => this.editSlide(newSlide), 100);
  }

  editSlide(slide: Slide) {
    const mats = this.materials();
    if (!mats?.slides) return;
    const index = mats.slides.indexOf(slide);
    this.editingSlideIndex.set(index);
    this.tempSlide = { ...slide };
    this.tempBullets = (slide.bulletPoints || []).join('\n');
  }

  cancelEditSlide() {
    this.editingSlideIndex.set(null);
  }

  saveSlide() {
    const mats = this.materials();
    const idx = this.editingSlideIndex();
    if (!mats?.slides || idx === null) return;

    const bullets = this.tempBullets.split('\n').filter((b) => b.trim());
    const updatedSlide = { ...this.tempSlide, bulletPoints: bullets };
    const slides = [...mats.slides];
    slides[idx] = updatedSlide;

    const updated = { ...mats, slides };
    this.saveMaterials(updated);
    this.editingSlideIndex.set(null);
  }

  deleteSlide(slide: Slide) {
    if (!confirm('Delete this slide?')) return;
    const mats = this.materials();
    if (!mats?.slides) return;

    const slides = mats.slides.filter((s) => s !== slide);
    const updated = { ...mats, slides };
    this.saveMaterials(updated);
  }

  // --- FLASHCARDS ---

  generateFlashcards() {
    const sec = this.section();
    if (!sec) return;
    this.isLoading.set(true);

    this.aiService.generateFlashcards(sec).subscribe((cards) => {
      const updated = { ...this.materials(), flashcards: cards };
      this.saveMaterials(updated as SectionMaterials);
      this.isLoading.set(false);
    });
  }

  addFlashcard() {
    const mats = this.materials();
    if (!mats) return;

    const newCard: Flashcard = { question: 'Question?', answer: 'Answer' };
    const flashcards = [...(mats.flashcards || []), newCard];
    const updated = { ...mats, flashcards };
    this.saveMaterials(updated);
  }

  editFlashcard(index: number, card: Flashcard) {
    this.editingFlashcardIndex.set(index);
    this.tempFlashcard = { ...card };
  }

  cancelEditFlashcard() {
    this.editingFlashcardIndex.set(null);
  }

  saveFlashcard(index: number) {
    const mats = this.materials();
    if (!mats?.flashcards) return;

    const flashcards = [...mats.flashcards];
    flashcards[index] = { ...this.tempFlashcard };
    const updated = { ...mats, flashcards };
    this.saveMaterials(updated);
    this.editingFlashcardIndex.set(null);
  }

  deleteFlashcard(index: number) {
    if (!confirm('Delete this flashcard?')) return;
    const mats = this.materials();
    if (!mats?.flashcards) return;

    const flashcards = mats.flashcards.filter((_, i) => i !== index);
    const updated = { ...mats, flashcards };
    this.saveMaterials(updated);
  }

  flipCard(index: number) {
    if (this.editingFlashcardIndex() === index) return;
    this.flippedCards.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }

  // --- QUIZ ---

  generateQuiz() {
    const sec = this.section();
    if (!sec) return;
    this.isLoading.set(true);

    this.aiService.generateQuiz(sec).subscribe((questions) => {
      const updated = { ...this.materials(), quiz: questions };
      this.saveMaterials(updated as SectionMaterials);
      this.isLoading.set(false);
      this.resetQuiz();
    });
  }

  addQuizQuestion() {
    const mats = this.materials();
    if (!mats) return;

    const newQ: QuizQuestion = {
      question: 'New Question?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswerIndex: 0,
    };
    const quiz = [...(mats.quiz || []), newQ];
    const updated = { ...mats, quiz };
    this.saveMaterials(updated);
  }

  editQuiz(index: number, q: QuizQuestion) {
    this.editingQuizIndex.set(index);
    this.tempQuiz = { ...q };
    this.tempQuizOptions = [...q.options];
  }

  cancelEditQuiz() {
    this.editingQuizIndex.set(null);
  }

  saveQuiz(index: number) {
    const mats = this.materials();
    if (!mats?.quiz) return;

    const quiz = [...mats.quiz];
    quiz[index] = { ...this.tempQuiz, options: [...this.tempQuizOptions] };
    const updated = { ...mats, quiz };
    this.saveMaterials(updated);
    this.editingQuizIndex.set(null);
  }

  deleteQuiz(index: number) {
    if (!confirm('Delete this question?')) return;
    const mats = this.materials();
    if (!mats?.quiz) return;

    const quiz = mats.quiz.filter((_, i) => i !== index);
    const updated = { ...mats, quiz };
    this.saveMaterials(updated);
  }

  selectAnswer(questionIndex: number, optionIndex: number) {
    this.userAnswers.update((answers) => ({
      ...answers,
      [questionIndex]: optionIndex,
    }));
  }

  submitQuiz() {
    this.quizSubmitted.set(true);
  }

  resetQuiz() {
    this.userAnswers.set({});
    this.quizSubmitted.set(false);
  }

  calculateScore(): number {
    const quiz = this.materials()?.quiz || [];
    if (quiz.length === 0) return 0;

    const answers = this.userAnswers();
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) correct++;
    });

    return Math.round((correct / quiz.length) * 100);
  }

  goBack() {
    this.router.navigate(['/plan', this.section()?.id]);
  }
}
