import { TestBed } from '@angular/core/testing';
import { TasksService } from '../tasks.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Task, TaskPriority } from '@take-home/shared';

describe('TasksService - Fuzzy Search', () => {
  let service: TasksService;

  const mockTasks: Task[] = [
    {
      uuid: '1',
      title: 'Complete assignment',
      completed: false,
      isArchived: false,
      description: 'My descriptiona',
      priority: TaskPriority.HIGH,
      scheduledDate: new Date(),
    },
    {
      uuid: '2',
      title: 'Check emails',
      completed: false,
      isArchived: false,
      description: null,
      priority: TaskPriority.HIGH,
      scheduledDate: new Date(),
    },
    {
      uuid: '3',
      title: 'Write documentation',
      completed: false,
      isArchived: false,
      description: null,
      priority: TaskPriority.HIGH,
      scheduledDate: new Date(),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService],
    });
    service = TestBed.inject(TasksService);
    service.tasks = [...mockTasks];
  });

  it('should find a task even if the user mistypes a search query', () => {
    service.searchTask('asignmnt');
    expect(service.tasks.length).toBe(1);
    expect(service.tasks[0].title).toBe('Complete assignment');
  });

  it('should return multiple tasks if they match the fuzzy search', () => {
    service.searchTask('check');
    expect(service.tasks.length).toBe(1);
    expect(service.tasks[0].title).toBe('Check emails');
  });

  it('should reset tasks when search is cleared', () => {
    service.searchTask('');
    expect(service.tasks.length).toBe(3);
  });
});
