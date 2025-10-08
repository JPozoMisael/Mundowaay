import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./components/login-modal/login-modal.component').then(m => m.LoginModalComponent)
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
  {
    path: 'quienes-somos',
    loadChildren: () => import('./paginas/corp/quienes-somos/quienes-somos.module').then( m => m.QuienesSomosPageModule)
  },
  {
    path: 'mision-vision',
    loadChildren: () => import('./paginas/corp/mision-vision/mision-vision.module').then( m => m.MisionVisionPageModule)
  },
  {
    path: 'iyd',
    loadChildren: () => import('./paginas/corp/iyd/iyd.module').then( m => m.IydPageModule)
  },
  {
    path: 'sostenibilidad',
    loadChildren: () => import('./paginas/corp/sostenibilidad/sostenibilidad.module').then( m => m.SostenibilidadPageModule)
  },
  {
    path: 'prensa',
    loadChildren: () => import('./paginas/corp/prensa/prensa.module').then( m => m.PrensaPageModule)
  },
  {
    path: 'como-comprar',
    loadChildren: () => import('./paginas/ayuda/como-comprar/como-comprar.module').then( m => m.ComoComprarPageModule)
  },
  {
    path: 'metodos-de-pago',
    loadChildren: () => import('./paginas/ayuda/metodos-de-pago/metodos-de-pago.module').then( m => m.MetodosDePagoPageModule)
  },
  {
    path: 'envios',
    loadChildren: () => import('./paginas/ayuda/envios/envios.module').then( m => m.EnviosPageModule)
  },
  {
    path: 'garantia',
    loadChildren: () => import('./paginas/ayuda/garantia/garantia.module').then( m => m.GarantiaPageModule)
  },
  {
    path: 'politica-devoluciones',
    loadChildren: () => import('./paginas/ayuda/politica-devoluciones/politica-devoluciones.module').then( m => m.PoliticaDevolucionesPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./paginas/ayuda/faq/faq.module').then( m => m.FaqPageModule)
  },
  {
    path: 'terminos-condiciones',
    loadChildren: () => import('./paginas/ayuda/terminos-condiciones/terminos-condiciones.module').then( m => m.TerminosCondicionesPageModule)
  },
  {
    path: 'politica-privacidad',
    loadChildren: () => import('./paginas/ayuda/politica-privacidad/politica-privacidad.module').then( m => m.PoliticaPrivacidadPageModule)
  },
  {
    path: 'formulario',
    loadChildren: () => import('./paginas/contacto/formulario/formulario.module').then( m => m.FormularioPageModule)
  },
  {
    path: 'sucursales',
    loadChildren: () => import('./paginas/contacto/sucursales/sucursales.module').then( m => m.SucursalesPageModule)
  },
  {
    path: 'soporte',
    loadChildren: () => import('./paginas/contacto/soporte/soporte.module').then( m => m.SoportePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./paginas/login/login.module').then( m => m.LoginPageModule)
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
