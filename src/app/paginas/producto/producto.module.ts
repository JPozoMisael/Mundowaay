import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared-module';
import { ProductoPage } from './producto.page';

const routes: Routes = [
  { path: '', component: ProductoPage }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ProductoPage],
  // Necesario para permitir <swiper-container> y <swiper-slide>
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductoPageModule {}
