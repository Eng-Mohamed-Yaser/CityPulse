import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IssueGroup, IssueSeverity, IssueStatus } from '../models/issue-group.model';
import { DEFAULT_FILTERS, IssueGroupFilters } from '../models/issue-group-filter.model';
import { IssueGroupService } from '../services/issue-group.service';

@Injectable({
  providedIn: 'root',
})
export class IssueGroupStore {
  private readonly issueGroupService = inject(IssueGroupService);

  // State Signals
  readonly groups = signal<IssueGroup[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly filters = signal<IssueGroupFilters>({ ...DEFAULT_FILTERS });
  readonly selectedGroup = signal<IssueGroup | null>(null);

  readonly isLoading = signal<boolean>(false);
  readonly isActionLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

  // Computed Signals
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.limit()))
  );

  readonly hasMorePages = computed(() => this.page() < this.totalPages());
  readonly hasPrevPages = computed(() => this.page() > 1);
  readonly isEmpty = computed(
    () => !this.isLoading() && this.groups().length === 0
  );

  /**
   * Filtered groups combines server-side fetched groups with
   * client-side instant search & severity filtering on the loaded page.
   */
  readonly filteredGroups = computed(() => {
    const list = this.groups() || [];
    const currentFilters = this.filters();
    const searchTerm = currentFilters.search?.trim().toLowerCase() ?? '';
    const severityFilter = currentFilters.severity;

    return list.filter((group) => {
      if (!group) return false;

      // Local Severity filter
      if (severityFilter && group.severity !== severityFilter) {
        return false;
      }

      // Local Search filter (matches category, ID, status, or coordinates)
      if (searchTerm) {
        const idMatch = (group._id || '').toLowerCase().includes(searchTerm);
        const catMatch = (group.category || '').toLowerCase().includes(searchTerm);
        const statusMatch = (group.status || '').toLowerCase().includes(searchTerm);
        const coordMatch =
          group.centerLocation?.coordinates
            ?.join(', ')
            .toLowerCase()
            .includes(searchTerm) ?? false;

        return idMatch || catMatch || statusMatch || coordMatch;
      }

      return true;
    });
  });

  /**
   * Summary counts for the currently loaded dataset.
   */
  readonly summaryCounts = computed(() => {
    const list = this.groups() || [];
    return {
      totalOnPage: list.length,
      pending: list.filter((g) => g?.status === 'Pending').length,
      inReview: list.filter((g) => g?.status === 'InReview').length,
      inProgress: list.filter((g) => g?.status === 'InProgress').length,
      resolved: list.filter((g) => g?.status === 'Resolved').length,
      critical: list.filter((g) => g?.severity === 'Critical').length,
      high: list.filter((g) => g?.severity === 'High').length,
    };
  });

  /* =========================================================
     Actions
  ========================================================= */

  /**
   * Load issue groups from server using current or specified filters.
   */
  loadGroups(customFilters?: Partial<IssueGroupFilters>): void {
    this.isLoading.set(true);
    this.error.set(null);

    const mergedFilters: IssueGroupFilters = {
      ...this.filters(),
      ...(customFilters ?? {}),
    };
    this.filters.set(mergedFilters);

    this.issueGroupService
      .getAll({
        category: mergedFilters.category,
        status: mergedFilters.status,
        page: mergedFilters.page,
        limit: mergedFilters.limit,
      })
      .subscribe({
        next: (response: any) => {
          // Robust data extraction supporting both wrapped { success, data: { groups, total } } and unwrapped shapes
          const extractedGroups: IssueGroup[] = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.groups)
            ? response.data.groups
            : Array.isArray(response?.groups)
            ? response.groups
            : [];

          const extractedTotal: number =
            typeof response?.data?.total === 'number'
              ? response.data.total
              : typeof response?.total === 'number'
              ? response.total
              : extractedGroups.length;

          const extractedPage: number =
            typeof response?.data?.page === 'number'
              ? response.data.page
              : typeof response?.page === 'number'
              ? response.page
              : mergedFilters.page;

          const extractedLimit: number =
            typeof response?.data?.limit === 'number'
              ? response.data.limit
              : typeof response?.limit === 'number'
              ? response.limit
              : mergedFilters.limit;

          this.groups.set(extractedGroups);
          this.total.set(extractedTotal);
          this.page.set(extractedPage);
          this.limit.set(extractedLimit);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          let errorMsg = 'Failed to load issue groups.';
          if (err.status === 401) {
            errorMsg = 'Authentication required (401). Please log in or provide an access token.';
          } else if (err.status === 0) {
            errorMsg = 'Cannot connect to backend server at ' + this.issueGroupService.getApiUrl() + '. Please ensure the server is running.';
          } else {
            errorMsg = err.error?.message || err.message || errorMsg;
          }

          this.error.set(errorMsg);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Load single issue group by ID.
   */
  loadGroupById(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.selectedGroup.set(null);

    this.issueGroupService.getById(id).subscribe({
      next: (response: any) => {
        const item = response?.data || response;
        this.selectedGroup.set(item);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        let errorMsg = `Failed to load issue group #${id}.`;
        if (err.status === 401) {
          errorMsg = 'Authentication required (401). Please log in or provide an access token.';
        } else if (err.status === 0) {
          errorMsg = 'Cannot connect to backend server. Please ensure the server is running.';
        } else {
          errorMsg = err.error?.message || err.message || errorMsg;
        }

        this.error.set(errorMsg);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Update server filters (category, status) or pagination. Resets page to 1 if server filters change.
   */
  changeFilters(updated: Partial<IssueGroupFilters>): void {
    const isServerFilterChanged =
      (updated.category !== undefined &&
        updated.category !== this.filters().category) ||
      (updated.status !== undefined &&
        updated.status !== this.filters().status);

    const newPage = isServerFilterChanged ? 1 : updated.page ?? this.page();

    const newFilters: IssueGroupFilters = {
      ...this.filters(),
      ...updated,
      page: newPage,
    };

    this.loadGroups(newFilters);
  }

  /**
   * Update client-side search query without triggering backend HTTP request.
   */
  setLocalSearch(search: string): void {
    this.filters.update((f) => ({ ...f, search }));
  }

  /**
   * Update client-side severity filter without triggering backend HTTP request.
   */
  setLocalSeverity(severity?: IssueSeverity): void {
    this.filters.update((f) => ({ ...f, severity }));
  }

  /**
   * Reset all filters to default.
   */
  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.loadGroups(DEFAULT_FILTERS);
  }

  /**
   * Pagination navigation.
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) return;
    this.changeFilters({ page });
  }

  nextPage(): void {
    if (this.hasMorePages()) {
      this.goToPage(this.page() + 1);
    }
  }

  previousPage(): void {
    if (this.hasPrevPages()) {
      this.goToPage(this.page() - 1);
    }
  }

  changeLimit(limit: number): void {
    this.changeFilters({ limit, page: 1 });
  }

  /**
   * Status transition action: calls PATCH /api/issue-groups/:id/status
   */
  updateStatus(id: string, status: IssueStatus, note?: string | null): void {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.issueGroupService
      .updateStatus(id, { status, note: note || null })
      .subscribe({
        next: (response: any) => {
          const updated = response?.data || response;
          this.selectedGroup.set(updated);
          this.updateGroupInList(updated);
          this.actionSuccess.set(
            response?.message || `Status successfully transitioned to ${status}.`
          );
          this.isActionLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.actionError.set(
            err.error?.message ||
              err.message ||
              'Failed to update status on server.'
          );
          this.isActionLoading.set(false);
        },
      });
  }

  /**
   * Severity escalation action: calls PATCH /api/issue-groups/:id/severity
   */
  escalateSeverity(id: string, severity: IssueSeverity): void {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.issueGroupService.escalateSeverity(id, { severity }).subscribe({
      next: (response: any) => {
        const updated = response?.data || response;
        this.selectedGroup.set(updated);
        this.updateGroupInList(updated);
        this.actionSuccess.set(
          response?.message ||
            `Severity successfully escalated to ${severity}.`
        );
        this.isActionLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.actionError.set(
          err.error?.message ||
            err.message ||
            'Failed to escalate severity on server.'
        );
        this.isActionLoading.set(false);
      },
    });
  }

  /**
   * Priority recalculation action: calls POST /api/issue-groups/:id/recalculate-priority
   */
  recalculatePriority(id: string): void {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.issueGroupService.recalculatePriority(id).subscribe({
      next: (response: any) => {
        const updated = response?.data || response;
        this.selectedGroup.set(updated);
        this.updateGroupInList(updated);
        this.actionSuccess.set(
          response?.message ||
            `Priority score recalculated to ${updated.priorityScore}.`
        );
        this.isActionLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.actionError.set(
          err.error?.message ||
            err.message ||
            'Failed to recalculate priority score on server.'
        );
        this.isActionLoading.set(false);
      },
    });
  }

  /**
   * Clear action notification alerts.
   */
  clearAlerts(): void {
    this.actionSuccess.set(null);
    this.actionError.set(null);
  }

  private updateGroupInList(updated: IssueGroup): void {
    if (!updated || !updated._id) return;
    this.groups.update((list) =>
      list.map((g) => (g._id === updated._id ? updated : g))
    );
  }
}
