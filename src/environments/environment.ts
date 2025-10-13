// =============================================
// 🌽 Mundo Way - Configuración de entorno local
// =============================================

// Durante el build, Angular reemplaza este archivo
// por environment.prod.ts si estás en modo producción.
// (ver angular.json)

export const environment = {
  production: false,

  // Backend local (Node.js + Express)
  apiUrl: 'http://localhost:4000/api',

  // Wix Headless App Client ID (puede ser público)
  wixClientId: '2792a362-dbae-4581-b8cd-9a14fdf5c6a4',

  // Rutas opcionales para desarrollo
  frontendUrl: 'http://localhost:8100', // Ionic local
};


/*
 * Para depuración en desarrollo:
 * puedes importar 'zone-error' para ver trazas detalladas.
 *  No lo habilites en producción.
 */
// import 'zone.js/plugins/zone-error';
