import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cookies } from './cookies';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Cookies', () => {
  let component: Cookies;
  let fixture: ComponentFixture<Cookies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cookies, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cookies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
