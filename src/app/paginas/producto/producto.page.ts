import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { CatalogoBus, CatalogItem } from 'src/app/servicios/catalogo-bus';

type VM = {
  id: string;
  title: string;
  image: string;
  gallery: string[];
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  sold?: string;
  promo?: string;
  badge?: string;
  brand?: string;
  desc?: string;
  tags?: string[];
};

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false,
})
export class ProductoPage implements OnInit {
  vm?: VM;
  currentImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private catalog: CatalogoBus,
    private cart: CartService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const p: CatalogItem | undefined = this.catalog.findById(id);
    if (!p) return;

    this.vm = {
      id: p.id,
      title: p.title,
      image: p.image || 'assets/img/placeholder.png',
      gallery: p.gallery && p.gallery.length ? p.gallery : [p.image || 'assets/img/placeholder.png'],
      price: p.price ?? 0,
      compareAt: p.compareAt,
      rating: p.rating ?? 4,
      reviews: p.reviews ?? 0,
      sold: p.sold,
      promo: p.promo,
      badge: p.badge,
      brand: p.brand,
      desc: p.desc,
      tags: p.tags ?? [],
    };

    this.currentImage = this.vm.image;
  }

  // 👉 método para actualizar imagen seleccionada
  setImage(img: string) {
    this.currentImage = img;
  }

  money(n: number) {
    return `$${(n || 0).toFixed(2)}`;
  }

  async addToCart() {
    if (!this.vm) return;
    this.cart.add(
      { id: this.vm.id, title: this.vm.title, price: this.vm.price, image: this.currentImage },
      1
    );

    const t = await this.toastCtrl.create({
      message: 'Añadido al carrito',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline',
    });
    await t.present();
  }
}
