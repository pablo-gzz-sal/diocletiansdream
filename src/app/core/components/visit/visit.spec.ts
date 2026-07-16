import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Visit } from './visit';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Visit', () => {
  let component: Visit;
  let fixture: ComponentFixture<Visit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Visit, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Visit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
