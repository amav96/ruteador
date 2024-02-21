export default [
    {
        path: '/usuarios',
        redirect: '/usuarios/listado',
        meta: { requiresAuth: true, gate: 'listar_usuarios' },
        component: () => import('src/layouts/MainLayout.vue'),
        children: [
          {
            path: 'listado',
            name: 'listado-usuarios',
            component: () => import('src/modules/Usuario/pages/ListadoUsuariosPage.vue'), 
          }
        ]
      }
]