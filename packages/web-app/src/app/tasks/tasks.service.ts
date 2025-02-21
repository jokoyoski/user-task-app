import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';
import * as Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}
  private readonly endpointUrl = 'http://localhost:3000/api/tasks';
  getTasksFromApi(): Observable<Task[]> {
    return this.http.get<Task[]>(this.endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        this.tasks = this.tasks.filter((task) => task.priority === 'HIGH');
        break;
      case 'scheduledDate':
        this.tasks = this.tasks.filter(
          (task) =>
            new Date(task.scheduledDate).toISOString().split('T')[0] ===
            new Date().toISOString().split('T')[0],
        );
        break;
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
        break;
    }
  }
  doneTask(task: Task): Observable<Task> {
    const updatedTask = { ...task, completed: true };
    return this.http.patch<Task>(
      `${this.endpointUrl}/${task.uuid}/done`,
      updatedTask,
    );
  }

  deleteTask(task: Task): Observable<Task> {
    const updatedTask = { ...task, isArchived: true };
    return this.http.patch<Task>(
      `${this.endpointUrl}/${task.uuid}/delete`,
      updatedTask,
    );
  }

  addTask(newTask: Task): Observable<Task> {
    return this.http.post<Task>(this.endpointUrl, newTask);
  }
  searchTask(search: string): void {
    if (search) {
      const fuse = new (Fuse as any)(this.tasks, {
        keys: ['title'],
        threshold: 0.5,
      });
      this.tasks = fuse.search(search).map((result: any) => result.item);
      console.log(this.tasks);
    } else {
      this.getTasksFromStorage();
    }
  }
}
