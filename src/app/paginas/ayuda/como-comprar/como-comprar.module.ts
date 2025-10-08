import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComoComprarPageRoutingModule } from './como-comprar-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { ComoComprarPage } from './como-comprar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ComoComprarPageRoutingModule
  ],
  declarations: [ComoComprarPage]
})
export class ComoComprarPageModule {}
