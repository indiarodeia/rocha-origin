import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { Lot } from '../models';

@Injectable({
  providedIn: 'root',
})
export class LotApiService extends BaseApiService {
  private readonly lotsPath = 'Lots';

  getAll(): Observable<Lot[]> {
    return this.http.get<Lot[]>(this.buildUrl(this.lotsPath));
  }
}
