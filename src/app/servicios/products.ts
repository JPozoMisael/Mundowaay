import { Injectable } from '@angular/core';

export type Product = {
  id: string;
  title: string;
  price?: number;
  compareAt?: number;
  imageUrl?: string;
  category: string;
  tags?: string[];
  desc?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private products: Product[] = [
    { id:'p1', title:'Semilla híbrida de maíz APACHE 60.000', category:'semillas', tags:['maíz','híbrido'], imageUrl:'assets/demo/maiz1.jpg', price: 35.9, compareAt: 42.0 },
    { id:'p2', title:'Herbicida AVGUST 480 SL', category:'herbicidas', tags:['post-emergente'], imageUrl:'assets/demo/herbicida.jpg', price: 11.5 },
    { id:'p3', title:'Bioestimulante foliar Kelp Max', category:'nutricion', tags:['algas','foliar'], imageUrl:'assets/demo/foliar.jpg', price: 8.2 },
    { id:'p4', title:'Bomba de mochila 20L', category:'maquinaria', tags:['fumigadora'], imageUrl:'assets/demo/bomba.jpg', price: 52.0 },
    { id:'p5', title:'Insecticida QSI 350', category:'insecticidas', tags:['plagas'], imageUrl:'assets/demo/insecticida.jpg', price: 19.9 },
  ];

  listAll() { return this.products.slice(); }

  search(q: string, category?: string): { items: Product[]; total: number } {
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const nq = norm(q || '');
    const predicate = (p: Product) => {
      const hay = norm(p.title);
      const tags = (p.tags || []).map(norm).join(' ');
      const cat  = norm(p.category);
      const hitQ = !nq || hay.includes(nq) || tags.includes(nq);
      const hitC = !category || cat === norm(category);
      return hitQ && hitC;
    };
    const items = this.listAll().filter(predicate);
    return { items, total: items.length };
  }
}
