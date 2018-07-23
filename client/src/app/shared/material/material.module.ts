import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialog,
  MatDialogModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatGridListModule,
  MatGridList,
  MatSelectModule,
  MatRadioModule,
  MatExpansionModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatToolbarModule,
    MatGridListModule,
    MatSelectModule,
    MatExpansionModule

  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatToolbarModule,
    MatGridListModule,
    MatSelectModule,
    MatExpansionModule
  ],
  declarations: [],
  providers: [
    MatDialog
  ]
})
export class MaterialModule { }
