import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useUsuarioStore } from 'src/stores/Usuario'
import { Preferences } from '@capacitor/preferences';

import { App } from '@capacitor/app';

let appInBackground: boolean = false;

let currentPath = '/';

const setPath = async (path: any) => {
  currentPath = path;
  await Preferences.set({ key: '_path', value: currentPath });
};

const getPath = async () : Promise<any> => {
  return await Preferences.get({ key: '_path'});
};

App.addListener('appStateChange', ({ isActive }) => {
  
  if (isActive) {
    // La aplicación está en primer plano
    appInBackground = false;
  } else {
    // La aplicación está en segundo plano
    appInBackground = true;
  }
});

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    if(to.path && to.path !== "/"){
      setPath(to.path);
    }
    

    const usuarioStore = useUsuarioStore()
    const {
      usuarioAutenticado,
      getUsuario,
      logout,
      autorizado
    } = usuarioStore
    
    if(to.meta.requiresAuth ){
      
      if(await usuarioAutenticado()){
          if(!await getUsuario()){
            logout()
            next('/autenticacion/login')
          } else {

            if(!to.meta.gate){
              next()
            } else {
              if(autorizado(to.meta.gate as string)){
                next()
              } else {
                next('/sin-permisos')
              }
            }
          }

      } else {
        next('/autenticacion/login')
      }
    } else {
      if (to.path === "/") {
        let storedPath = await getPath();
        if(storedPath.value){
          next(storedPath.value);
        } else {
          next('recorridos/listado-recorrido');
        }
        
      } else {
        next();
      }
    }

  })

  return Router;
});
