export default [
    {
        path: '/recorridos',
        redirect: '/recorridos/crear-recorrido',
        component: () => import('src/layouts/MainLayout.vue'),
        children: [
          { 
            path: 'listado', 
            name: 'listado-recorrido',
            meta: { requiresAuth: true},
            component: () => import('src/modules/Recorrido/pages/ListadoRecorridosPage.vue'), 
          },
          { 
            path: ':recorrido_id', 
            name: 'recorrido',
            meta: { requiresAuth: true},
            component: () => import('src/modules/Recorrido/pages/RecorridoPage.vue'), 
            children: [
              {
                path: 'buscar-direccion/:addressValue?/:id?/:origin?/:destination?',
                name: 'buscar-direccion',
                component: () => import('src/modules/Recorrido/pages/BuscarDireccion.vue'), 
                children : [
                  {
                    path: 'detectar-propiedades',
                    name: 'detectar-propiedades',
                    component: () => import('src/modules/Recorrido/pages/Parada/ModalDetectarParada.vue'), 
                  }
                ]
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
              },
              {
                path: 'mapa-paradas',
                name: 'mapa-paradas',
                component: () => import('src/modules/Recorrido/pages/ModalMapaRecorrido.vue'), 
                
              },
            ],
          },
          { 
            path: 'crear-recorrido', 
            name: 'crear-recorrido',
            meta: { requiresAuth: true},
            component: () => import('src/modules/Recorrido/pages/CrearRecorridoPage.vue'), 
          },
    
        ],
      }
]