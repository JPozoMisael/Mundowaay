import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'semillas',
    loadChildren: () => import('./paginas/semillas/semillas.module').then( m => m.SemillasPageModule)
  },
  {
    path: 'insecticidas',
    loadChildren: () => import('./paginas/insecticidas/insecticidas.module').then( m => m.InsecticidasPageModule)
  },
  {
    path: 'herbicidas',
    loadChildren: () => import('./paginas/herbicidas/herbicidas.module').then( m => m.HerbicidasPageModule)
  },
  {
    path: 'fungicidas',
    loadChildren: () => import('./paginas/fungicidas/fungicidas.module').then( m => m.FungicidasPageModule)
  },
  {
    path: 'acaricidas',
    loadChildren: () => import('./paginas/acaricidas/acaricidas.module').then( m => m.AcaricidasPageModule)
  },
  {
    path: 'nutricion',
    loadChildren: () => import('./paginas/nutricion/nutricion.module').then( m => m.NutricionPageModule)
  },
  {
    path: 'maquinaria',
    loadChildren: () => import('./paginas/maquinaria/maquinaria.module').then( m => m.MaquinariaPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./paginas/cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./paginas/search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'producto/:id',
    loadChildren: () => import('./paginas/producto/producto.module').then( m => m.ProductoPageModule)
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
