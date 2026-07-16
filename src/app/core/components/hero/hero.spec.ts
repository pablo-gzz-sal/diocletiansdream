import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hero } from './hero';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
