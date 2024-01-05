import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { 
        path: 'recorridos', 
        name: 'recorridos',
        component: () => import('pages/RecorridoPage.vue'), 
        children: [
          {
            path: 'buscar-direccion',
            name: 'buscar-direccion',
            component: () => import('components/recorridos/ModalBuscador.vue'), 
          }
        ]
      },

    ],
  },
  {
    path: '/',
    component: () => import('layouts/NavegadorLayout.vue'),
    children: [
      { 
        path: 'recorridos', 
        name: 'recorridos',
        component: () => import('pages/RecorridoPage.vue'), 
        children: [
          {
            path: 'buscar-direccion/:addressValue?/:index?',
            name: 'buscar-direccion',
            component: () => import('components/recorridos/ModalBuscador.vue'), 
            
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
