import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaquinariaPageRoutingModule } from './maquinaria-routing.module';

import { MaquinariaPage } from './maquinaria.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaquinariaPageRoutingModule
  ],
  declarations: [MaquinariaPage]
})
export class MaquinariaPageModule {}
