import { Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: false,
})
export class AppHeaderComponent  implements OnInit {
  @Input() cartCount = 0;
  @Output() search = new EventEmitter<string>();
  @Output() category = new EventEmitter<string>();

  constructor(private router: Router, private menu: MenuController, private cart: CartService) { }

  ngOnInit() {
    this.cart.count$.subscribe(n => this.cartCount = n);   
  }

  onSearch(ev:any){ const q = ev.detail?.value?.trim(); if(q) this.search.emit(q); }
  catChange(ev:any){ this.category.emit(ev.detail?.value); }
  goCart(){ this.router.navigateByUrl('/cart'); }
  openMenu(){ this.menu.enable(true, 'mainMenu'); this.menu.open('mainMenu'); }
}
