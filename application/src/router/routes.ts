import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
 
  {
    path: '/recorridos',
    redirect: '/crear-recorrido',
    meta: { requiresAuth: true},
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: ':recorrido_id', 
        name: 'recorrido',
        component: () => import('pages/Recorrido/RecorridoPage.vue'), 
        children: [
          {
            path: 'buscar-direccion/:addressValue?/:id?/:origin?/:destination?',
            name: 'buscar-direccion',
            component: () => import('pages/Recorrido/BuscarDireccion.vue'), 
            
          }
        ]
      },
      { 
        path: 'crear-recorrido', 
        name: 'crear-recorrido',
        meta: { requiresAuth: true},
        component: () => import('pages/Recorrido/CrearRecorridoPage.vue'), 
      },

    ],
  },
  {
    path: '/autenticacion',
    component: () => import('layouts/AutenticarLayout.vue'),
    children:[ 
      {
        path: 'login',
        component: () => import('pages/Autenticacion/Login.vue'), 
      }
    ]
  },
 

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
