import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared-module';
import { IonicModule } from '@ionic/angular';

import { NutricionPageRoutingModule } from './nutricion-routing.module';

import { NutricionPage } from './nutricion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    NutricionPageRoutingModule
  ],
  declarations: [NutricionPage]
})
export class NutricionPageModule {}
