import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutProject } from './about-project';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('AboutProject', () => {
  let component: AboutProject;
  let fixture: ComponentFixture<AboutProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutProject, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
