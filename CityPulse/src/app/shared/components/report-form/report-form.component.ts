import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CATEGORY_CONFIG,
  ISSUE_CATEGORIES,
  IssueCategory,
} from '../../../features/issue-groups/models/issue-group.model';

/**
 * Incident report form.
 *
 * The drag-and-drop image-preview logic is carried over verbatim from the
 * original HomeComponent so behaviour is unchanged; it lives here instead so it
 * can be rendered on both the home page and /reports without duplicating
 * file-upload handling.
 *
 * Submission is intentionally inert (`preventDefault`), exactly as before. The
 * server's `POST /api/reports` is not wired up here: it currently reads
 * `req.user._id`, which the auth middleware never sets, so it always 401s. No
 * fake success state is shown.
 */
@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="$event.preventDefault()" class="space-y-5" novalidate>
      <div>
        <label for="issue-title" class="block text-sm font-medium text-content">
          Issue summary
        </label>
        <input
          type="text"
          id="issue-title"
          placeholder="e.g. Hazardous pothole on 5th Avenue"
          class="mt-1.5 w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-content transition-colors placeholder:text-content-subtle focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        />
      </div>

      <div>
        <label for="issue-category" class="block text-sm font-medium text-content">
          Category
        </label>
        <select
          id="issue-category"
          class="mt-1.5 w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-content transition-colors focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        >
          @for (category of categories; track category) {
            <option [value]="category">{{ config[category].label }}</option>
          }
        </select>
      </div>

      <div>
        <span class="block text-sm font-medium text-content">Issue photograph</span>

        <div
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          [class.border-primary]="isDragging()"
          [class.bg-primary-subtle]="isDragging()"
          class="relative mt-1.5 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-line-strong bg-surface-muted p-7 text-center transition-colors hover:border-primary/60"
        >
          <input
            type="file"
            accept="image/*"
            (change)="onFileSelected($event)"
            aria-label="Upload an image of the issue"
            class="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
          />

          @if (!previewUrl()) {
            <div class="flex flex-col items-center justify-center">
              <span
                class="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary"
              >
                <svg
                  class="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <p class="text-sm font-semibold text-content">
                Drop your image here, or
                <span class="text-primary underline underline-offset-4">browse files</span>
              </p>
              <p class="mt-1 text-xs text-content-subtle">
                Supports JPG, PNG and WEBP
              </p>
            </div>
          } @else {
            <div
              class="group relative h-56 w-full overflow-hidden rounded-xl border border-line"
            >
              <img
                [src]="previewUrl()"
                alt="Preview of the issue photograph you selected"
                class="h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 focus-within:opacity-100"
              >
                <button
                  type="button"
                  (click)="removeFile($event)"
                  class="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove photo
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <div>
        <label for="issue-desc" class="block text-sm font-medium text-content">
          Additional context / landmarks
        </label>
        <textarea
          id="issue-desc"
          rows="3"
          placeholder="Add specific street markers or landmark details…"
          class="mt-1.5 w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-content transition-colors placeholder:text-content-subtle focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        ></textarea>
      </div>

       <a routerLink="/reports" class="btn-primary w-full">Open the report form</a>

      <p class="flex items-start gap-2 text-xs text-content-subtle">
        <svg
          class="mt-0.5 h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.25 11.25h1.5v5h-1.5v-5Zm.75-4.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
         <span>
          This preview keeps your image in the browser. Open the full report form
          to add the report and receive a success or failure message.
        </span>
      </p>
    </form>
  `,
})
export class ReportFormComponent {
  protected readonly categories: readonly IssueCategory[] = ISSUE_CATEGORIES;
  protected readonly config = CATEGORY_CONFIG;

  // --- Behaviour below is unchanged from the original HomeComponent ---

  readonly previewUrl = signal<string | null>(null);
  readonly isDragging = signal<boolean>(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.previewUrl.set(null);
  }
}
