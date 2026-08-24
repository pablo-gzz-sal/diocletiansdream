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

  it('exposes the five-star rating as one labelled image', () => {
    const stars = fixture.nativeElement.querySelector('.reviews-stars') as HTMLElement;

    expect(stars).not.toBeNull();
    expect(stars.getAttribute('role')).toBe('img');
    expect(stars.getAttribute('aria-label')).toBe('5 out of 5 stars');
    expect(stars.querySelectorAll('svg[aria-hidden="true"]').length).toBe(5);
  });
});
