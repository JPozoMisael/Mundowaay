import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

// Components
import { FooterComponent } from '../components/footer/footer.component';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { LocationModalComponent } from '../components/location-modal/location-modal.component';

@NgModule({
  declarations: [
    FooterComponent, 
    LoginModalComponent, 
    LocationModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule   
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,  
    FooterComponent,
    LoginModalComponent,
    LocationModalComponent
  ]
})
export class SharedModule {}
