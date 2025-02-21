import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskPriority } from '@take-home/shared';
import { TASKS_STORE_DI_TOKEN } from './tasks.store';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_STORE_DI_TOKEN)
    private tasksStore: Task[],
  ) {}

  getTasks(): Task[] {
    return this.tasksStore.filter((task) => !task.isArchived);
  }

  addTask(newTask: Partial<Task>): Task {
    const task: Task = {
      uuid: newTask.uuid,
      title: newTask.title || 'Untitled Task',
      description: newTask.description || '',
      priority: newTask.priority || TaskPriority.LOW,
      scheduledDate: newTask.scheduledDate
        ? new Date(newTask.scheduledDate)
        : new Date(),
      completed: false,
      isArchived: false,
    };
    this.tasksStore.push(task);
    return task;
  }

  doneTask(uuid: string): Task {
    const task = this.tasksStore.find((task) => task.uuid === uuid);
    if (!task) {
      throw new NotFoundException(`Task with uuid ${uuid} not found.`);
    }
    task.completed = true;
    return task;
  }

  deleteTask(uuid: string): Task {
    const task = this.tasksStore.find((task) => task.uuid === uuid);
    if (!task) {
      throw new NotFoundException(`Task with uuid ${uuid} not found.`);
    }
    task.isArchived = true;
    return task;
  }
}
