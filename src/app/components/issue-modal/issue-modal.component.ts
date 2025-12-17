
import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Issue, IssuePriority, IssueStatus } from '../../models/issue.model';

@Component({
  selector: 'app-issue-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './issue-modal.component.html'
})
export class IssueModalComponent {
  isOpen = input.required<boolean>();
  issueToEdit = input<Issue | null>(null);
  
  close = output<void>();
  save = output<Omit<Issue, 'id' | 'createdAt'> | Issue>();
  delete = output<string>();

  private fb: FormBuilder = inject(FormBuilder);

  form = this.fb.group({
    id: [''],
    createdAt: [''],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(1000)]],
    status: ['todo' as IssueStatus, Validators.required],
    priority: ['medium' as IssuePriority, Validators.required],
    assignee: ['']
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const issue = this.issueToEdit();
        if (issue) {
          this.form.patchValue(issue);
        } else {
          this.form.reset({
            status: 'todo',
            priority: 'medium',
            title: '',
            description: '',
            assignee: ''
          });
        }
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      
      const issueData: any = {
        title: formValue.title!,
        description: formValue.description || '',
        status: formValue.status as IssueStatus,
        priority: formValue.priority as IssuePriority,
        assignee: formValue.assignee || undefined
      };

      if (formValue.id) {
        issueData.id = formValue.id;
        issueData.createdAt = formValue.createdAt;
      }

      this.save.emit(issueData);
      this.onClose();
    } else {
      this.form.markAllAsTouched();
    }
  }

  onDelete() {
    const id = this.form.value.id;
    if (id) {
      if(confirm('Are you sure you want to delete this issue?')) {
        this.delete.emit(id);
        this.onClose();
      }
    }
  }
}
