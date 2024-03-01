<template>
  <q-layout view="hHh Lpr lff" class="AppRoot-fullPage bg-grey-2">
    <q-header style="position: relative !important;" >
      <q-toolbar class="bg-grey-2 flex row justify-between no-border">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="deep-purple-13"
          @click="toggleLeftDrawer"
        />

        <q-img
          :src="logo"
          style="max-width: 30px"
        />
        
        <q-btn
          flat
          dense
          round
          color="deep-purple-13"
        />

        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>

    <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        :width="200"
        :breakpoint="500"
      >
        <q-scroll-area class="fit">
          <q-list padding class="menu-list">

            <template v-if="autorizado(Permisos.OPERACION_LISTAR_MIS_RECORRIDOS)">
              <q-item @click="router.push({name: 'listado-recorrido'})" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="deep-purple-13" name="route" />
                </q-item-section>

                <q-item-section>
                  Recorridos
                </q-item-section>
              </q-item>
              <q-separator />
            </template>

            <template v-if="autorizado(Permisos.OPERACION_CREAR_RECORRIDO)">
              <q-item @click="router.push({name: 'crear-recorrido'})" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="deep-purple-13" name="map" />
                </q-item-section>

                <q-item-section>
                  Crear recorrido
                </q-item-section>
              </q-item>
              <q-separator />
            </template>

            <template v-if="autorizado(Permisos.OPERACION_LISTAR_MIS_ITEMS)">
              <q-item @click="router.push({name: 'items-tablero' , params: { usuario_id : usuarioStore.usuario.id}})" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="deep-purple-13" name="attach_money" />
                </q-item-section>

                <q-item-section>
                  Mi gestión
                </q-item-section>
              </q-item>
              <q-separator />
            </template>

            <q-item @click="router.push({name: 'me' , params: { usuario_id : usuarioStore.usuario.id}})" clickable v-ripple>
              <q-item-section avatar>
                <q-icon color="deep-purple-13" name="person" />
              </q-item-section>

              <q-item-section>
                Perfil
              </q-item-section>
            </q-item>
            <q-separator /> 

          
            <template v-if="autorizado(Permisos.ADMINISTRACION_USUARIOS_LISTADO)">
              <q-item @click="router.push({name: 'listado-usuarios'})" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="deep-purple-13" name="people" />
                </q-item-section>

                <q-item-section>
                  Usuarios
                </q-item-section>
              </q-item>
              <q-separator />
            </template>

            <q-item @click="cerrarSesion" clickable v-ripple>
              <q-item-section avatar>
                <q-icon color="deep-purple-13" name="logout" />
              </q-item-section>

              <q-item-section>
                Salir
              </q-item-section>
            </q-item>
            <q-separator />


          </q-list>
        </q-scroll-area>
    </q-drawer>

    <dialog-loading :open="cerrandoSesion" text="Saliendo de  la aplicacion" />

    <q-page-container class="AppMain__layer__PageAndTopBar">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import logo from 'src/assets/rendereable logo.png'
import { useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from 'src/stores/Usuario'
import DialogLoading from 'src/components/General/DialogLoading.vue'
import AutenticacionRepository from 'src/repositories/Autenticacion.repository';
import Permisos from 'src/utils/Permisos';

const autenticacionRepository = new AutenticacionRepository();

const usuarioStore = useUsuarioStore()
const { logout, autorizado } = usuarioStore

const router = useRouter();
const route = useRoute();

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}



const cerrandoSesion = ref<boolean>(false)
const cerrarSesion = async () => {

  if(cerrandoSesion.value) return

  try {
    cerrandoSesion.value = true;
    await autenticacionRepository.logout()
    logout()
    
  } catch (error) {
    
  } finally{
    cerrandoSesion.value = false;
    router.push({name: 'login'})
  }
}

</script>

<style>
.q-layout__section--marginal{
  background-color: #fafafa !important;
}
.q-toolbar {
  padding: 0 9px;
}
</style>