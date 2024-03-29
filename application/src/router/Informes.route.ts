import Permisos from 'src/utils/Permisos';

export default [
    {
        path: '/informes',
        redirect: '/informes/items-tablero',
        meta: { requiresAuth: true },
        component: () => import('src/layouts/MainLayout.vue'),
        children: [
          {
            meta: { gate: Permisos.OPERACION_LISTAR_MIS_ITEMS},
            path: 'items-tablero/:usuario_id',
            name: 'items-tablero',
            component: () => import('src/modules/Informe/pages/Item/InformeItemPage.vue'), 
          }
        ]
    },

]