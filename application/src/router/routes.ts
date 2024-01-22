import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [

  {
    path: '/recorridos',
    redirect: '/recorridos/crear-recorrido',
    meta: { requiresAuth: true},
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: ':recorrido_id', 
        name: 'recorrido',
        component: () => import('src/modules/Recorrido/pages/RecorridoPage.vue'), 
        children: [
          {
            path: 'buscar-direccion/:addressValue?/:id?/:origin?/:destination?',
            name: 'buscar-direccion',
            component: () => import('src/modules/Recorrido/pages/BuscarDireccion.vue'), 
          },
          {
            path: 'parada/:parada_id',
            name: 'parada',
            component: () => import('src/modules/Recorrido/pages/Parada/ModalDetalleParada.vue'), 
            children: [
              {
                path: 'agregar-item',
                name: 'agregar-item',
                component: () => import('src/modules/Recorrido/pages/Parada/ModalGuardarItem.vue'), 
              },
              {
                path: 'editar-item-cliente/:item_id/:cliente_id?',
                name: 'editar-item-cliente',
                component: () => import('src/modules/Recorrido/pages/Parada/ModalGuardarItem.vue'), 
              },
            ]
          }
        ],
      },
      { 
        path: 'crear-recorrido', 
        name: 'crear-recorrido',
        meta: { requiresAuth: true},
        component: () => import('src/modules/Recorrido/pages/CrearRecorridoPage.vue'), 
      },

    ],
  },
  {
    path: '/autenticacion',
    component:  () => import('src/modules/Autenticacion/layouts/AutenticarLayout.vue'), 
    children:[ 
      {
        path: 'login',
        component: () => import('src/modules/Autenticacion/pages/Login.vue'), 
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
