import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { Task, generateTask } from '@take-home/shared';
import { Observable, of } from 'rxjs';
import { ListComponent } from './list.component';
import { TasksService } from '../tasks.service';
import { MatCardModule } from '@angular/material/card';
import { FiltersComponent } from '../filters/filters.component';
import { SearchComponent } from '../search/search.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

const fakeTasks: Task[] = [
  generateTask({ uuid: '3', completed: false }),
  generateTask({ uuid: '4', completed: false }),
];

class MockTasksService {
  tasks: Task[] = [];

  constructor() {
    this.tasks = [
      generateTask({ uuid: '3', completed: false }),
      generateTask({ uuid: '4', completed: false }),
    ];
  }

  getTasksFromApi(): Observable<Task[]> {
    return of(this.tasks);
  }

  getTasksFromStorage(): Promise<Task[]> {
    return Promise.resolve(this.tasks);
  }

  filterTask(key: keyof Task): void {
    this.tasks = this.tasks.filter((task) => !task[key]);
  }

  doneTask(task: Task): Observable<Task> {
    task.completed = true;
    return of(task);
  }

  deleteTask(task: Task): Observable<Task> {
    task.isArchived = true;
    return of(task);
  }
}

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  updateTaskItem(): void {
    return;
  }
}

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let loader: HarnessLoader;
  let component: ListComponent;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
      ],
      declarations: [ListComponent, FiltersComponent, SearchComponent],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: StorageService, useClass: MockStorageService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    tasksService = TestBed.inject(TasksService);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('Tasks');
  });

  it(`should display total number of tasks`, () => {
    const total = fixture.debugElement.query(By.css('h3'));
    expect(total.nativeElement.textContent).toEqual(
      `Total Tasks: ${fakeTasks.length}`,
    );
  });

  it(`should display list of tasks as mat-cards`, () => {
    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length);
  });

  it(`should navigate to /add when add button is clicked`, async () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['add']);
  });

  it('should mark a task as complete when done button is clicked', async () => {
    jest.spyOn(component, 'onDoneTask');
    fixture.detectChanges();
    const doneButton = fixture.debugElement.query(
      By.css('[data-testid="complete-task"]'),
    );
    expect(doneButton).not.toBeNull();
    const taskItem = fixture.debugElement.query(By.css('.done-button'));
    taskItem.triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
  });
  it('should mark a task as archived when delete button is clicked', async () => {
    jest.spyOn(component, 'onDeleteTask');

    fixture.detectChanges();
    const deleteButton = fixture.debugElement.query(
      By.css('[data-testid="delete-task"]'),
    );
    expect(deleteButton).not.toBeNull();

    deleteButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].isArchived).toBe(true);
  });
  it('should not display archived tasks after deleting them', () => {
    tasksService.deleteTask(tasksService.tasks[0]);
    tasksService.filterTask('isArchived');
    fixture.detectChanges();
    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(1);
  });
});
