<template>
     
    <q-page class="full-height flex column no-wrap q-pa-md contenedor-section">
        
        <div class="text-h6">
            Sociedades 
        </div>

        <div class="flex column no-wrap justify-center" v-if="usuariosEmpresas && usuariosEmpresas.length > 0">
            <listado-usuarios-empresas
            :usuarios-empresas="usuariosEmpresas"
            :campos-mostrar="['invitador' ,'invitado' ,'rol' ,'estado', 'email_invitado', 'empresa']"
            @terminar-relacion="terminarRelacion"
            />
        </div>
        <div v-else-if="!trayendoUsuariosEmpresas">
            <q-card 
            style="border-radius:10px;" 
            flat  
            class="bg-white rounded-xs q-mt-md "
            >
            <q-card-section>
                No tenes sociedades aún
            </q-card-section>
            </q-card>
        </div>

        <q-spinner
        v-if="trayendoUsuariosEmpresas"
        class="flex justify-center full-width q-my-md"
        color="primary"
        size="2em"
        />

    </q-page>
       
</template>

<script setup lang="ts">
import EmpresaRepository from 'src/repositories/Empresa.repository';
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import UsuarioEmpresaRepository from 'src/repositories/UsuarioEmpresa.repository';
import { useRouter, useRoute } from 'vue-router';
import { InvitacionEmpresaModel } from 'src/models/InvitacionEmpresa.model';
import ListadoUsuariosEmpresas from 'src/modules/Empresa/components/ListadoUsuariosEmpresas.vue'
import { useUsuarioStore } from 'src/stores/Usuario'
import { storeToRefs } from 'pinia';
import UsuarioPage from 'src/modules/Usuario/pages/UsuarioPage.vue';
import { UsuarioEmpresaModel } from 'src/models/UsuarioEmpresa.model';

const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore()
const { usuario } = storeToRefs(usuarioStore);

const usuarioEmpresaRepository = new UsuarioEmpresaRepository();
const empresaRepository = new EmpresaRepository();

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

onMounted(() => {
    getUsuariosEmpresas()
})

const usuariosEmpresas = ref<UsuarioEmpresaModel[] | null>(null)
const trayendoUsuariosEmpresas = ref<boolean>(false)
const getUsuariosEmpresas = async () => {


    try {
        trayendoUsuariosEmpresas.value = true;
        const response = await usuarioEmpresaRepository.get({ 
            usuario_id: usuario.value.id,
            incluir: ['rol', 'empresa', 'usuario', 'invitacion.invitador'],
            eliminadas: true
        });
        
        usuariosEmpresas.value = response;
    } catch (error) {
        
    } finally {
        trayendoUsuariosEmpresas.value = false;
    }
}

const modificandoInvitacion = ref<boolean>(false)
const terminarRelacion = async (usuarioEmpresa: UsuarioEmpresaModel) => {
    if(modificandoInvitacion.value) return
    try {
        modificandoInvitacion.value = true;
        const response = await usuarioEmpresaRepository.terminarRelacion(usuarioEmpresa.id);
        if(response && usuariosEmpresas.value){
            let indexUsuarioEmpresa = usuariosEmpresas.value.findIndex((usuarioEmpresa) => usuarioEmpresa.id === response.id)
            if(indexUsuarioEmpresa > -1){
                usuariosEmpresas.value[indexUsuarioEmpresa] = response;
            }

            $q.notify({
                type: 'positive',
                message: 'Terminada correctamente',
                position: 'bottom',
                timeout: 1500
            })
        }
    } catch (error) {
        
    } finally {
        modificandoInvitacion.value = false;
    }
}



</script>

<style scoped>

</style>