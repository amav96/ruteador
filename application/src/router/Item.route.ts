export default [
    {
      path: '/listado-items/:usuario_id',
      name: 'listado-items',
      meta: { requiresAuth: true},
      component: () => import('src/modules/Informe/pages/Item/ListadoItemsPage.vue'), 
    }
]