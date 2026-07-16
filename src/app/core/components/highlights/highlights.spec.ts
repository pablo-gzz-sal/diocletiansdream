import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Highlights } from './highlights';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Highlights', () => {
  let component: Highlights;
  let fixture: ComponentFixture<Highlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Highlights, ...commonTestImports],
      providers: [...commonTestProviders]
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
