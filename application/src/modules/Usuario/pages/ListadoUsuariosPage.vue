<template>
    <div class="q-pa-md">
    <q-table
      flat 
      bordered
      title="Usuarios"
      :rows="usuarios"
      :columns="columns"
      row-key="name"
      hide-pagination
      :rows-per-page-options="[20]"
    >
      <template v-slot:body="props">
        <q-tr :props="props" >
          <q-td key="email" :props="props">
            {{ props.row.email }}
          </q-td>
          <q-td key="nombre" :props="props">
              {{ props.row.nombre }}
          </q-td>
          <q-td key="usuario_consumo.cantidad_optimizar" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.cantidad_optimizar : '' }} 
          </q-td>
          <q-td key="usuario_consumo.consumo_optimizar" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.consumo_optimizar : '' }} 
          </q-td>
          <q-td key="usuario_consumo.cantidad_detectar" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.cantidad_detectar : '' }} 
          </q-td>
          <q-td key="usuario_consumo.consumo_detectar" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.consumo_detectar : '' }} 
          </q-td>
          <q-td key="usuario_consumo.cantidad_informes" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.cantidad_informes : '' }} 
          </q-td>
          <q-td key="usuario_consumo.consumo_polyline" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.consumo_polyline : '' }} 
          </q-td>
          <q-td key="usuario_consumo.cantidad_polyline" :props="props"> 
            {{ props.row.usuario_consumo ? props.row.usuario_consumo.cantidad_polyline : '' }} 
          </q-td>
          <q-td key="paradas_total" :props="props"> 
            {{ props.row.paradas_total ? props.row.paradas_total : '' }} 
          </q-td>
          <q-td key="paradas_hoy" :props="props"> 
            {{ props.row.paradas_hoy ? props.row.paradas_hoy : '' }} 
          </q-td>
          <q-td v-if="puederUsurpar" key="acciones" :props="props"> 
            <q-btn-dropdown size="xs" color="primary" label="">
              <q-list>
                <q-item clickable v-close-popup >
                  <q-item-section @click="usurpar(props.row)">
                    <q-item-label>Usurpar</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div v-if="!trayendoUsuarios && usuarios.length > 0"  class="flex justify-center q-my-sm">
        <q-pagination
        v-model="pagination.page"
        :max="pagination.last_page"
        max-page="10"
        direction-links
        />
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import UsuarioRepository from 'src/repositories/Usuario.repository';
import { UsuarioModel } from 'src/models/Usuario.model';
import { reactive , ref, computed, watch } from 'vue';
import { useUsuarioStore } from 'src/stores/Usuario'
import Permisos from 'src/utils/Permisos';
import { useQuasar } from 'quasar';
import AutenticacionRepository from 'src/repositories/Autenticacion.repository';
import { useRouter } from 'vue-router';
import { Browser } from '@capacitor/browser';

const router = useRouter();

const autenticacionRepository = new AutenticacionRepository();

const $q = useQuasar()
let timer : any

const usuarioStore = useUsuarioStore()
const { autorizado } = usuarioStore;

const usuarioRepository = new UsuarioRepository()

onMounted(async () => {
    await getUsuarios()
})

const pagination = reactive({
    page: 1,
    total: 5,
    last_page: 1,
    next_page_url: '',
    prev_page_url: ''
})

const currentPage = computed(() => pagination.page)

watch(currentPage, (newVal) => {

if(pagination.next_page_url || pagination.prev_page_url){
    pagination.page = newVal
    getUsuarios();
}
})

const puederUsurpar = computed(() => {
  return autorizado(Permisos.ADMINISTRACION_USURPAR_USUARIOS)
})

const usuarios = ref<UsuarioModel[]>([])
const columns : any = [
  { name: 'email', align: 'center', label: 'Email', field: 'email'},
  { name: 'nombre', align: 'center', label: 'Nombre', field: 'nombre'},
  { name: 'usuario_consumo.cantidad_optimizar', align: 'center', label: 'Optimizaciones', field: 'usuario_consumo.cantidad_optimizar' },
  { name: 'usuario_consumo.consumo_optimizar', align: 'center', label: 'Importe Optimizaciones', field: 'usuario_consumo.consumo_optimizar' },
  { name: 'usuario_consumo.cantidad_detectar', align: 'center', label: 'Visiones', field: 'usuario_consumo.cantidad_detectar' },
  { name: 'usuario_consumo.consumo_detectar', align: 'center', label: 'Importe vision', field: 'usuario_consumo.consumo_detectar' },
  { name: 'usuario_consumo.cantidad_polyline', align: 'center', label: 'Polylines', field: 'usuario_consumo.cantidad_polyline' },
  { name: 'usuario_consumo.consumo_polyline', align: 'center', label: 'Importe polyline', field: 'usuario_consumo.consumo_polyline' },
  { name: 'usuario_consumo.cantidad_informes', align: 'center', label: 'Informes generados', field: 'usuario_consumo.cantidad_informes' },
  { name: 'paradas_total', align: 'center', label: 'Paradas total', field: 'paradas_total' },
  { name: 'paradas_hoy', align: 'center', label: 'Paradas hoy', field: 'paradas_hoy' },
  puederUsurpar ? { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' } : {}
]

const trayendoUsuarios = ref<boolean>(false)
const getUsuarios = async () => {

    try {
        usuarios.value = []
        const params = {
            page: pagination.page
        }
        trayendoUsuarios.value = true;
        const usuariosServer = await usuarioRepository.get(params);
        if('data' in usuariosServer){
            const { data, current_page, total, last_page, next_page_url, prev_page_url } = usuariosServer 
            console.log(total)
            usuarios.value = data
            pagination.page = current_page
            pagination.total = total
            pagination.last_page = last_page
            pagination.next_page_url = next_page_url
            pagination.prev_page_url = prev_page_url

        } 
    } catch (error) {
        
    } finally {
        trayendoUsuarios.value = false;
    }
}

const usurpando = ref<boolean>(false);
const usurpar = async (usuarioUsurpar: UsuarioModel) => {
 
  if(usurpando.value)  return

  try {
    usurpando.value = true;
    $q.loading.show()

    const response = await autenticacionRepository.usurpar(usuarioUsurpar.id);
    const { usuario: usuarioServer , token } = response;
    if(usuarioServer && token){
        $q.loading.hide()
        completarLogin(usuarioServer, token)
    }

  } catch (error) {
    
  } finally {
    usurpando.value = false;
    $q.loading.hide()
  }
}

const completarLogin = async (usuarioUsurpado: UsuarioModel, token: string) => {
    usuarioStore.setUsuario(usuarioUsurpado);
    usuarioStore.setToken(token);
    setTimeout(() => {
      router.push({name: 'listado-recorrido'})
    }, 500);
}

</script>

<style scoped>

</style>