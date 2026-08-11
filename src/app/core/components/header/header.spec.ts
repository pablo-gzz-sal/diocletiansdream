import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Header } from './header';
import { PostLanguageRouteService } from '../../i18n/post-language-route.service';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switches a registered English post to its Croatian translation', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    spyOnProperty(router, 'url', 'get').and.returnValue('/diocletians-palace-vr-experience');
    const navigate = spyOn(router, 'navigateByUrl');
    routes.register('/diocletians-palace-vr-experience', {
      en: 'diocletians-palace-vr-experience',
      hr: 'vr-iskustvo-dioklecijanova-palaca',
    });

    component.switchTo('hr');

    expect(navigate).toHaveBeenCalledWith('/hr/vr-iskustvo-dioklecijanova-palaca');
  });

  it('falls back to the Croatian homepage for an unknown English post', () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/unknown-post');
    const navigate = spyOn(router, 'navigateByUrl');

    component.switchTo('hr');

    expect(navigate).toHaveBeenCalledWith('/hr');
  });

  it('switches a registered Croatian post to its English root slug', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    spyOnProperty(router, 'url', 'get').and.returnValue('/hr/vr-iskustvo-dioklecijanova-palaca');
    const navigate = spyOn(router, 'navigateByUrl');
    spyOn(component, 'currentLang').and.returnValue('hr');
    routes.register('/hr/vr-iskustvo-dioklecijanova-palaca', {
      en: 'diocletians-palace-vr-experience',
      hr: 'vr-iskustvo-dioklecijanova-palaca',
    });

    component.switchTo('en');

    expect(navigate).toHaveBeenCalledWith('/diocletians-palace-vr-experience');
  });
});
