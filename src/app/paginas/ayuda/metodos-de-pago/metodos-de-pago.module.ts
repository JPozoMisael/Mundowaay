import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MetodosDePagoPageRoutingModule } from './metodos-de-pago-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { MetodosDePagoPage } from './metodos-de-pago.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    MetodosDePagoPageRoutingModule
  ],
  declarations: [MetodosDePagoPage]
})
export class MetodosDePagoPageModule {}
