import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalePathPipe } from '../../../core/i18n/locale-path.pipe';

@Component({
  selector: 'app-blog-invite',
  standalone: true,
  imports: [RouterLink, TranslateModule, LocalePathPipe],
  templateUrl: './blog-invite.html',
  styleUrl: './blog-invite.css',
})
export class BlogInvite {
  // Optional overrides
  @Input() title = '';
  @Input() text = '';

  // Show secondary links?
  @Input() showSecondaryLinks = false;
}
