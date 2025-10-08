import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SucursalesPageRoutingModule } from './sucursales-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { SucursalesPage } from './sucursales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    SucursalesPageRoutingModule
  ],
  declarations: [SucursalesPage]
})
export class SucursalesPageModule {}
