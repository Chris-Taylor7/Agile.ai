
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Issue, IssueStatus } from '../models/issue.model';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  // Default to localhost:3000 for local development
  private readonly API_URL = 'http://localhost:3000/api/issues';
  private readonly STORAGE_KEY = 'agile_board_issues';
  
  // State
  private issuesSignal = signal<Issue[]>([]);

  // Selectors
  readonly issues = this.issuesSignal.asReadonly();
  
  constructor() {
    this.loadIssues();
  }

  private loadIssues() {
    this.http.get<Issue[]>(this.API_URL).pipe(
      tap(issues => {
        console.log('Loaded issues from API');
        this.issuesSignal.set(issues);
        // Sync to local storage for backup
        this.saveToStorage(issues);
      }),
      catchError(err => {
        console.warn('Backend API unavailable. Falling back to LocalStorage.', err);
        this.loadFromStorage();
        return of([]);
      })
    ).subscribe();
  }

  private loadFromStorage() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.issuesSignal.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse issues', e);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private saveToStorage(issues: Issue[]) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(issues));
  }

  private seedInitialData() {
    const initialData: Issue[] = [
      {
        id: '1',
        title: 'Setup Project Structure',
        description: 'Initialize Angular project with Tailwind CSS.',
        status: 'done',
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Implement Drag & Drop',
        description: 'Create Kanban board with HTML5 Drag and Drop API.',
        status: 'inprogress',
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Connect AI Service',
        description: 'Integrate Gemini API for auto-generating descriptions.',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString()
      }
    ];
    this.issuesSignal.set(initialData);
    this.saveToStorage(initialData);
  }

  addIssue(issueData: Omit<Issue, 'id' | 'createdAt'>) {
    const newIssue: Issue = {
      ...issueData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    // Optimistic UI Update
    this.issuesSignal.update(issues => {
      const updated = [...issues, newIssue];
      this.saveToStorage(updated);
      return updated;
    });

    // API Call
    this.http.post<Issue>(this.API_URL, newIssue).pipe(
      catchError(err => {
        console.error('API Error (Add):', err);
        return of(null);
      })
    ).subscribe();
  }

  updateIssue(updatedIssue: Issue) {
    // Optimistic UI Update
    this.issuesSignal.update(issues => {
      const updated = issues.map(i => i.id === updatedIssue.id ? updatedIssue : i);
      this.saveToStorage(updated);
      return updated;
    });

    // API Call
    this.http.put(`${this.API_URL}/${updatedIssue.id}`, updatedIssue).pipe(
      catchError(err => {
        console.error('API Error (Update):', err);
        return of(null);
      })
    ).subscribe();
  }

  updateIssueStatus(id: string, status: IssueStatus) {
    const issue = this.issuesSignal().find(i => i.id === id);
    if (!issue) return;

    const updatedIssue = { ...issue, status };

    // Optimistic UI Update
    this.issuesSignal.update(issues => {
      const updated = issues.map(i => i.id === id ? updatedIssue : i);
      this.saveToStorage(updated);
      return updated;
    });

    // API Call
    this.http.put(`${this.API_URL}/${id}`, updatedIssue).pipe(
      catchError(err => {
        console.error('API Error (Status Update):', err);
        return of(null);
      })
    ).subscribe();
  }

  deleteIssue(id: string) {
    // Optimistic UI Update
    this.issuesSignal.update(issues => {
      const updated = issues.filter(i => i.id !== id);
      this.saveToStorage(updated);
      return updated;
    });

    // API Call
    this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError(err => {
        console.error('API Error (Delete):', err);
        return of(null);
      })
    ).subscribe();
  }

  getIssue(id: string): Issue | undefined {
    return this.issuesSignal().find(i => i.id === id);
  }
}
