import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Task, TaskPriority } from '@take-home/shared';
import { TASKS_STORE_DI_TOKEN } from './tasks.store';

describe('TasksService', () => {
  let service: TasksService;
  let tasksStore: Task[];

  beforeEach(async () => {
    tasksStore = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TASKS_STORE_DI_TOKEN, useValue: tasksStore },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('getTasks', () => {
    it('should return all tasks in the store', () => {
      const fakeTasks: Task[] = [
        {
          uuid: '1',
          title: 'Task 1',
          description: 'Description 1',
          priority: TaskPriority.MEDIUM,
          scheduledDate: new Date(),
          completed: false,
          isArchived: false,
        },
        {
          uuid: '2',
          title: 'Task 2',
          description: 'Description 2',
          priority: TaskPriority.HIGH,
          scheduledDate: new Date(),
          completed: false,
          isArchived: false,
        },
      ];

      tasksStore.push(...fakeTasks);

      expect(service.getTasks()).toEqual(fakeTasks);
    });
  });

  describe('addTask', () => {
    it('should create and store a new task', () => {
      const newTask: Partial<Task> = {
        title: 'New Task',
        description: 'Task Description',
        priority: TaskPriority.LOW,
        uuid: '1234-5678-uuid',
        scheduledDate: new Date(),
      };

      const createdTask = service.addTask(newTask);

      expect(createdTask).toMatchObject(newTask);
      expect(createdTask.uuid).toBeDefined();
      expect(createdTask.completed).toBe(false);
      expect(createdTask.isArchived).toBe(false);
      expect(tasksStore.length).toBe(1);
    });
  });
});
