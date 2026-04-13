import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly returnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

  login(): void {
    void this.router.navigateByUrl(this.returnUrl);
  }

  // Auth0 redirect logic will be restored here later.
}
