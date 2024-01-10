import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
 
  {
    path: '/',
    redirect: '/recorridos',
    component: () => import('layouts/NavegadorLayout.vue'),
    children: [
      { 
        path: 'recorridos', 
        name: 'recorridos',
        component: () => import('pages/RecorridoPage.vue'), 
        children: [
          {
            path: 'buscar-direccion/:addressValue?/:id?/:origin?/:destination?',
            name: 'buscar-direccion',
            component: () => import('components/recorridos/BuscarDireccion.vue'), 
            
          }
        ]
      },

    ],
  },
 

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
