import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroReveal } from './intro-reveal';

describe('IntroReveal', () => {
  let component: IntroReveal;
  let fixture: ComponentFixture<IntroReveal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroReveal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroReveal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
