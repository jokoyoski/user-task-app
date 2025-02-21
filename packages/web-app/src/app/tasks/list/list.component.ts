import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { take } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  onDoneTask(item: Task): void {
    item.completed = true;
    this.tasksService.doneTask(item).subscribe({
      next: () => {
        console.log('Task marked as completed');
        // Refresh tasks from API
        this.tasksService.getTasksFromApi().subscribe({
          next: (tasks) => {
            this.tasksService.tasks = tasks;
            console.log('Tasks refreshed:', tasks);
          },
          error: (err) => {
            console.error('Error fetching tasks:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error marking task as completed:', err);
      },
    });
  }

  onDeleteTask(item: Task): void {
    item.isArchived = true;
    this.tasksService.deleteTask(item).subscribe({
      next: () => {
        console.log('Task archived successfully');
        this.tasksService.getTasksFromApi().subscribe({
          next: (tasks) => {
            this.tasksService.tasks = tasks;
            console.log('Tasks refreshed:', tasks);
          },
          error: (err) => {
            console.error('Error fetching tasks:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error archiving task:', err);
      },
    });
  }

  onAddTask(): void {
    this.router.navigate(['add']);
  }

  private getTaskList(): void {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(
        async (tasks) => {
          // Clear existing tasks in storage before updating
          await this.storageService.clearTasks();

          // Now update the cache with new tasks
          await Promise.all(
            tasks.map((task) => this.storageService.updateTaskItem(task)),
          );

          // Refresh tasks from storage after updating the cache
          await this.tasksService.getTasksFromStorage();
          console.log('Tasks cache cleared, updated, and loaded from storage');
        },
        (error) => {
          console.error('Error fetching tasks from API:', error);
        },
      );
  }
}
