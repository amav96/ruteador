export default [
    {
        path: '/usuarios',
        redirect: '/usuarios/listado',
        meta: { requiresAuth: true, gate: 'administracion_usuarios_listado' },
        component: () => import('src/layouts/MainLayout.vue'),
        children: [
          {
            path: 'listado',
            name: 'listado-usuarios',
            component: () => import('src/modules/Usuario/pages/ListadoUsuariosPage.vue'), 
          }
        ]
    },
    {
      path: '/usuario',
      redirect: '/usuario/me',
      meta: { requiresAuth: true,  },
      component: () => import('src/layouts/FreeLayout.vue'),
      children: [
        {
          path: 'me/:usuario_id',
          name: 'me',
          component: () => import('src/modules/Usuario/pages/UsuarioPage.vue'), 
        }
      ]
  }

]