import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from '@take-home/shared';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  listTasks(): Task[] {
    return this.tasksService.getTasks();
  }
  @Post()
  createTask(@Body() newTask: Task): Task {
    return this.tasksService.addTask(newTask);
  }

  @Patch(':uuid/done')
  markTaskDone(@Param('uuid') uuid: string): Task {
    return this.tasksService.doneTask(uuid);
  }

  @Patch(':uuid/delete')
  deleteTask(@Param('uuid') uuid: string): Task {
    return this.tasksService.deleteTask(uuid);
  }
}
