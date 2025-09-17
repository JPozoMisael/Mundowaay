import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared-module';
import { InsecticidasPageRoutingModule } from './insecticidas-routing.module';

import { InsecticidasPage } from './insecticidas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    InsecticidasPageRoutingModule
  ],
  declarations: [InsecticidasPage]
})
export class InsecticidasPageModule {}
