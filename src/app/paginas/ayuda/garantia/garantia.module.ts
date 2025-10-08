import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GarantiaPageRoutingModule } from './garantia-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { GarantiaPage } from './garantia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    GarantiaPageRoutingModule
  ],
  declarations: [GarantiaPage]
})
export class GarantiaPageModule {}
