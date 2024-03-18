export default [
    {
      path: '/empresas',
      name: 'empresas',
      redirect: '/empresas',
      meta: { requiresAuth: true },
      component: () => import('src/layouts/MainLayout.vue'), 
      children: [
        {
            path: '/empresas',
            name: 'empresas',
            meta: { requiresAuth: true },
            component: () => import('src/modules/Empresa/pages/EmpresaPage.vue'), 
            children: [
              {
                path: 'usuarios/:empresa_id',
                name: 'usuarios-empresa',
                meta: { requiresAuth: true },
                component: () => import('src/modules/Empresa/pages/Empresa/UsuariosEmpresaPage.vue'), 
              }
            ]
        },
        {
          path: '/sociedades',
          name: 'empresas-sociedades',
          meta: { requiresAuth: true },
          component: () => import('src/modules/Empresa/pages/UsuariosEmpresasPage.vue'), 
        }
      ]
    }
]