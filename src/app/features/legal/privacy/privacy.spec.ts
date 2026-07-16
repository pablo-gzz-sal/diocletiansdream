import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Privacy } from './privacy';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Privacy', () => {
  let component: Privacy;
  let fixture: ComponentFixture<Privacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Privacy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
