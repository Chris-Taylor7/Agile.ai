
import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Issue } from '../../models/issue.model';

@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div 
      class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
    >
      <div class="flex justify-between items-start mb-2">
        <span 
          class="text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide"
          [class.bg-red-100]="issue().priority === 'high'"
          [class.text-red-700]="issue().priority === 'high'"
          [class.bg-yellow-100]="issue().priority === 'medium'"
          [class.text-yellow-700]="issue().priority === 'medium'"
          [class.bg-blue-100]="issue().priority === 'low'"
          [class.text-blue-700]="issue().priority === 'low'"
        >
          {{ issue().priority }}
        </span>
        <button 
          (click)="edit.emit(issue())"
          class="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </button>
      </div>
      
      <h3 class="font-medium text-gray-800 mb-1 leading-snug">{{ issue().title }}</h3>
      
      <p class="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
        {{ issue().description || 'No description provided.' }}
      </p>
      
      <div class="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
        <div class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>{{ issue().createdAt | date:'MMM d' }}</span>
        </div>
        
        @if (issue().assignee) {
          <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]" title="Assignee: {{issue().assignee}}">
            {{ issue().assignee?.slice(0,2)?.toUpperCase() }}
          </div>
        }
      </div>
    </div>
  `
})
export class IssueCardComponent {
  issue = input.required<Issue>();
  edit = output<Issue>();
}
