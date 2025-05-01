import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export function provideNgMaterial() {
  return [
    provideAnimations(),
    provideNativeDateAdapter(),
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ];
}