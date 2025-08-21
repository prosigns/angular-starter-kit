import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  private readonly _sanitizer = inject(DomSanitizer);

  public transform(text: string, search: string): SafeHtml {
    if (!search || !text) {
      return this._sanitizer.bypassSecurityTrustHtml(text);
    }

    // Escape special RegExp characters
    const searchRegex = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex with all separate words from search
    const regex = new RegExp(
      `(${searchRegex
        .split(' ')
        .filter(t => t.length > 0)
        .join('|')})`,
      'gi'
    );

    // Replace matches with highlighted version
    const replaced = text.replace(regex, '<span class="highlight">$1</span>');

    // Return sanitized HTML
    return this._sanitizer.bypassSecurityTrustHtml(replaced);
  }
}
