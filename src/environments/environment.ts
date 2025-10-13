// =============================================
// 🌽 Mundo Way - Configuración de entorno local
// =============================================

// Este archivo se usa cuando Angular corre en modo desarrollo.
// Durante el build para producción, será reemplazado por environment.prod.ts
// (ver angular.json)

export const environment = {
  production: false,

  // 🚀 Backend local (Node.js + Express)
  apiUrl: 'http://localhost:4000/api',

  // 👥 Wix Headless App Client ID (no sensible)
  wixClientId: '2792a362-dbae-4581-b8cd-9a14fdf5c6a4',

  // 🧭 Frontend local (Ionic / Angular Dev Server)
  frontendUrl: 'http://localhost:8100',

  // 🔁 Alias opcional para uso del GeneralService
  localApiUrl: 'http://localhost:4000/api'
};
