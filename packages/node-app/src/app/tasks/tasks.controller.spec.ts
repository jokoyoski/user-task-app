import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { NotImplementedException } from '@nestjs/common';
import { Task, TaskPriority } from '@take-home/shared';
import { of } from 'rxjs';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    getTasks: jest.fn(),
    addTask: jest.fn().mockReturnValue(of({})),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  describe('listTasks', () => {
    it('should return a list of tasks from the service', () => {
      const tasks: Task[] = [
        {
          uuid: '1',
          title: 'Task 1',
          description: 'Description 1',
          priority: TaskPriority.MEDIUM,
          scheduledDate: new Date(),
          completed: false,
          isArchived: false,
        },
      ];

      jest.spyOn(service, 'getTasks').mockReturnValue(tasks);

      expect(controller.listTasks()).toEqual(tasks);
    });
  });

  describe('createTask', () => {
    it('should create and return a new task', () => {
      const newTask: Task = {
        uuid: '1234-5678-uuid',
        title: 'New Task', // ✅ Ensure title is explicitly defined
        description: 'Task Description',
        priority: TaskPriority.HIGH,
        scheduledDate: new Date(),
        completed: false,
        isArchived: false,
      };

      jest.spyOn(service, 'addTask').mockReturnValue(newTask);

      expect(controller.createTask(newTask)).toEqual(newTask);
      expect(service.addTask).toHaveBeenCalledWith(newTask);
    });
  });
});
