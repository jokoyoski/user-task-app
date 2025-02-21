import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TasksService } from '../tasks.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'take-home-add-task',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent {
  addTaskForm: FormGroup;
  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private tasksService: TasksService,
    private router: Router,
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 7);

    this.addTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: [''],
      priority: ['LOW', Validators.required],
      scheduledDate: [
        null,
        [Validators.required, this.validateDate.bind(this)],
      ],
    });
  }

  validateDate(control: AbstractControl): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    if (selectedDate < this.minDate || selectedDate > this.maxDate) {
      return { invalidDate: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.addTaskForm.valid) {
      const newTask = {
        uuid: faker.string.uuid(),
        ...this.addTaskForm.value,
        completed: false,
        isArchived: false,
      };

      this.tasksService.addTask(newTask).subscribe({
        next: () => {
          console.log('Task successfully created');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error creating task:', err);
          alert('Failed to create task. Please try again.');
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
