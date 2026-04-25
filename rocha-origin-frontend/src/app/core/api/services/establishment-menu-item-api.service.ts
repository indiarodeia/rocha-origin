import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { EstablishmentMenuItem } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EstablishmentMenuItemApiService extends BaseApiService {
  private readonly menuItemsPath = 'EstablishmentMenuItems';

  getByEstablishmentId(establishmentId: string): Observable<EstablishmentMenuItem[]> {
    return this.http.get<EstablishmentMenuItem[]>(
      this.buildUrl(`${this.menuItemsPath}/by-establishment/${establishmentId}`),
    );
  }
}
