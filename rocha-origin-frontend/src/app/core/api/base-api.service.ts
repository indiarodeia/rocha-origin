import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable()
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  protected buildUrl(path: string): string {
    const normalizedPath = path.replace(/^\/+/, '');
    return `${this.apiBaseUrl}/${normalizedPath}`;
  }
}
