import { RouteRecordRaw } from 'vue-router';
import InformesRoute from './Informes.route';
import UsuarioRoute from './Usuario.route';
import AutenticacionRoute from './Autenticacion.route';
import RecorridoRoute from './Recorrido.route';
import ItemRoute from './Item.route';
import EmpresaRoute from './Empresa.route';
import InvitacionEmpresaRoute from './InvitacionEmpresa.route';

const routes: RouteRecordRaw[] = [
  ...RecorridoRoute,
  ...AutenticacionRoute,
  ...UsuarioRoute,
  ...InformesRoute,
  ...ItemRoute,
  ...EmpresaRoute,
  ...InvitacionEmpresaRoute,
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/sin-permisos',
    component: () => import('pages/403.vue'),
  },
];

export default routes;
