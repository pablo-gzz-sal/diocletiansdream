import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reviews } from './reviews';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Reviews', () => {
  let component: Reviews;
  let fixture: ComponentFixture<Reviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reviews, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reviews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
