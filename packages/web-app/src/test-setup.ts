import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import 'fake-indexeddb/auto';
setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

TestBed.configureTestingModule({
  imports: [NoopAnimationsModule],
});
