
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueService } from '../../services/issue.service';
import { COLUMNS, Issue, IssueStatus } from '../../models/issue.model';
import { IssueCardComponent } from '../issue-card/issue-card.component';
import { IssueModalComponent } from '../issue-modal/issue-modal.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, IssueCardComponent, IssueModalComponent],
  templateUrl: './kanban-board.component.html'
})
export class KanbanBoardComponent {
  private issueService = inject(IssueService);
  
  columns = COLUMNS;
  
  // Search State
  searchQuery = signal('');

  // Filtered Issues Computed
  filteredIssues = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const issues = this.issueService.issues();
    
    if (!query) {
      return issues;
    }
    
    return issues.filter(issue => 
      issue.title.toLowerCase().includes(query)
    );
  });

  // Computed columns for easy template access
  todoIssues = computed(() => this.filteredIssues().filter(i => i.status === 'todo'));
  inprogressIssues = computed(() => this.filteredIssues().filter(i => i.status === 'inprogress'));
  doneIssues = computed(() => this.filteredIssues().filter(i => i.status === 'done'));

  // Drag and Drop State
  draggedIssueId = signal<string | null>(null);

  // Modal State
  isModalOpen = signal(false);
  selectedIssue = signal<Issue | null>(null);

  getIssuesForColumn(columnId: IssueStatus): Issue[] {
    switch (columnId) {
      case 'todo': return this.todoIssues();
      case 'inprogress': return this.inprogressIssues();
      case 'done': return this.doneIssues();
      default: return [];
    }
  }

  // --- Search Handler ---
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // --- Drag & Drop Handlers ---
  onDragStart(event: DragEvent, issueId: string) {
    this.draggedIssueId.set(issueId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', issueId);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necessary to allow dropping
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    // Optional: Add visual cue for drop zone here using event.currentTarget
    const target = event.currentTarget as HTMLElement;
    target.classList.add('bg-opacity-75', 'ring-2', 'ring-blue-400', 'ring-opacity-50');
  }

  onDragLeave(event: DragEvent) {
     const target = event.currentTarget as HTMLElement;
     target.classList.remove('bg-opacity-75', 'ring-2', 'ring-blue-400', 'ring-opacity-50');
  }

  onDrop(event: DragEvent, newStatus: string) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('bg-opacity-75', 'ring-2', 'ring-blue-400', 'ring-opacity-50');

    const issueId = this.draggedIssueId();
    if (issueId) {
      this.issueService.updateIssueStatus(issueId, newStatus as IssueStatus);
    }
    this.draggedIssueId.set(null);
  }

  // --- Modal Handlers ---
  openCreateModal() {
    this.selectedIssue.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(issue: Issue) {
    this.selectedIssue.set(issue);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedIssue.set(null);
  }

  onSaveIssue(issueData: Omit<Issue, 'id' | 'createdAt'> | Issue) {
    if ('id' in issueData) {
      this.issueService.updateIssue(issueData as Issue);
    } else {
      this.issueService.addIssue(issueData);
    }
  }

  onDeleteIssue(id: string) {
    this.issueService.deleteIssue(id);
  }
}
