import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SostenibilidadPageRoutingModule } from './sostenibilidad-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { SostenibilidadPage } from './sostenibilidad.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    SostenibilidadPageRoutingModule
  ],
  declarations: [SostenibilidadPage]
})
export class SostenibilidadPageModule {}
