export default [
    {
      path: '/invitaciones',
      name: 'invitaciones',
      redirect: '/invitaciones/invitaciones-empresa',
      meta: { requiresAuth: true },
      component: () => import('src/layouts/MainLayout.vue'), 
      children: [
        {
          path: '/invitaciones-empresa',
          name: 'invitaciones-empresa',
          meta: { requiresAuth: true },
          component: () => import('src/modules/Empresa/pages/InvitacionesPage.vue'), 
        }
        
      ]
    },
    

]