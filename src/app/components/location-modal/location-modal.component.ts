import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocationService, LocationData } from 'src/app/servicios/location';
@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.scss'],
  standalone: false,
})
export class LocationModalComponent  implements OnInit {
  province: string | null = null;

  provincias = [
    'Azuay','Bolívar','Cañar','Carchi','Chimborazo','Cotopaxi','El Oro',
    'Esmeraldas','Galápagos','Guayas','Imbabura','Loja','Los Ríos','Manabí',
    'Morona Santiago','Napo','Orellana','Pastaza','Pichincha','Santa Elena',
    'Santo Domingo','Sucumbíos','Tungurahua','Zamora Chinchipe'
  ];

  constructor(
    private modalCtrl: ModalController,
    private locationSvc: LocationService
  ) { }

  ngOnInit() {}

  dismiss(){
    this.modalCtrl.dismiss();
  }

  save(){
    if(this.province){
      this.locationSvc.setLocation({ province: this.province});
      this.dismiss();
    }
  }

  autoDetect(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos => {
        const loc: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.locationSvc.setLocation(loc);
        this.dismiss();
      })
    }
  }
}
