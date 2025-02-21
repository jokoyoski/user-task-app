import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { AddComponent } from './add.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Router } from '@angular/router';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TasksService } from '../tasks.service';
import { of } from 'rxjs';
import {
  HttpClientTestingModule,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskPriority } from '@take-home/shared';

class MockStorageService {
  updateTaskItem(): void {
    return;
  }
}

class MockTasksService {
  addTask = jest.fn().mockReturnValue(of({}));
}

describe('AddComponent', () => {
  let fixture: ComponentFixture<AddComponent>;
  let loader: HarnessLoader;
  let component: AddComponent;
  let storageService: StorageService;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        AddComponent,
        MatSelectModule,
      ],
      declarations: [],
      providers: [
        { provide: StorageService, useClass: MockStorageService },
        { provide: TasksService, useClass: MockTasksService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    storageService = TestBed.inject(StorageService);
    tasksService = TestBed.inject(TasksService);
    fixture = TestBed.createComponent(AddComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('Add Task Title');
  });

  it(`should navigate to home when cancel button is clicked`, async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    const cancelButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="cancel"]' }),
    );

    await cancelButton.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it(`should prevent adding task without a valid title`, async () => {
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );

    expect(await addButton.isDisabled()).toBeTruthy();

    // Invalid title
    component.addTaskForm.controls['title'].setValue('Invalid');
    component.addTaskForm.controls['priority'].setValue('HIGH');
    component.addTaskForm.controls['scheduledDate'].setValue(new Date());
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeTruthy();

    // Valid title and other fields
    component.addTaskForm.controls['title'].setValue('Valid Task Title');
    component.addTaskForm.controls['priority'].setValue('HIGH');
    component.addTaskForm.controls['scheduledDate'].setValue(new Date());
    fixture.detectChanges();

    // Now, the button should be enabled
    expect(await addButton.isDisabled()).toBeFalsy();
  });

  it(`should create a new task for a valid submission and navigate home`, fakeAsync(() => {
    jest.spyOn(tasksService, 'addTask').mockReturnValue(
      of({
        uuid: '1234',
        title: 'Valid Task Title',
        description: 'Sample Description',
        priority: TaskPriority.HIGH,
        completed: false,
        isArchived: false,
        scheduledDate: new Date(),
      }),
    );

    component.addTaskForm.controls['title'].setValue('Valid Task Title');
    component.addTaskForm.controls['description'].setValue(
      'Sample Description',
    );
    component.addTaskForm.controls['priority'].setValue('HIGH');
    component.addTaskForm.controls['scheduledDate'].setValue(new Date());

    component.onSubmit();
    tick();

    expect(tasksService.addTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Valid Task Title',
        description: 'Sample Description',
        priority: 'HIGH',
        completed: false,
        isArchived: false,
      }),
    );
  }));

  it('should navigate back home after submitting a valid task', fakeAsync(() => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    jest.spyOn(tasksService, 'addTask').mockReturnValue(
      of({
        uuid: '1234',
        title: 'Valid Task Title',
        description: 'Sample Description',
        priority: TaskPriority.HIGH,
        completed: false,
        isArchived: false,
        scheduledDate: new Date(),
      }),
    );

    component.addTaskForm.controls['title'].setValue('Valid Task Title');
    component.addTaskForm.controls['description'].setValue(
      'Sample Description',
    );
    component.addTaskForm.controls['priority'].setValue('HIGH');
    component.addTaskForm.controls['scheduledDate'].setValue(new Date());

    component.onSubmit();
    tick();

    expect(tasksService.addTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Valid Task Title',
        description: 'Sample Description',
        priority: 'HIGH',
        completed: false,
        isArchived: false,
      }),
    );

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));
  it('should display an error message if an invalid date is selected', fakeAsync(() => {
    const dateControl = component.addTaskForm.controls['scheduledDate'];
    dateControl.setValue(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)); // Invalid date (10 days from now)

    dateControl.markAsTouched();

    fixture.detectChanges();
    tick(); // Run pending async tasks

    const errorElement =
      fixture.debugElement.nativeElement.querySelector('mat-error');

    expect(errorElement).not.toBeNull();
    expect(errorElement.textContent).toContain(
      'Date must be within the next 7 days',
    );
  }));
});
