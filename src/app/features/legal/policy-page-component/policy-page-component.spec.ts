import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyPageComponent } from './policy-page-component';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('PolicyPageComponent', () => {
  let component: PolicyPageComponent;
  let fixture: ComponentFixture<PolicyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyPageComponent, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
