import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalePathPipe } from '../../../core/i18n/locale-path.pipe';
import { ConsentService } from '../../../shared/services/consent.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule, LocalePathPipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  year = new Date().getFullYear();

  private consent = inject(ConsentService);

  openCookieSettings(): void {
    this.consent.reopen();
  }
}
