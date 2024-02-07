import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { boot } from 'quasar/wrappers';
// import vue3GoogleLogin from 'vue3-google-login'
// Llama al cargador de elementos personalizados antes de que se realice la llamada a render
defineCustomElements(window);

// export default boot(({ app }) => {
   
//     app.use(vue3GoogleLogin, {
//         clientId: '258214718434-rrole8msmiuh271n5eu8l2eqloss3smn.apps.googleusercontent.com'
//       })
// });
