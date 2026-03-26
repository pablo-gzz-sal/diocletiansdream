import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Highlights } from './highlights';

describe('Highlights', () => {
  let component: Highlights;
  let fixture: ComponentFixture<Highlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Highlights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Highlights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
