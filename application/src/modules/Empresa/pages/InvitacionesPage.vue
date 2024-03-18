<template>
     
    <q-page class="full-height flex column no-wrap q-pa-md contenedor-section">
        
        <div class="text-h6">
            Invitaciones 
        </div>

        <div class="flex column no-wrap justify-center" v-if="usuario && invitaciones && invitaciones.length > 0">
            <listado-invitaciones
            :invitaciones="invitaciones"
            :usuario="usuario"
            @eliminar-invitacion="eliminarInvitacion"
            @aceptar-invitacion="aceptarInvitacion"
            @rechazar-invitacion="rechazarInvitacion"
            />
        </div>
        <div v-else-if="!trayendoInvitaciones">
            <q-card 
            style="border-radius:10px;" 
            flat  
            class="bg-white rounded-xs q-mt-md "
            >
            <q-card-section>
                No tenes invitaciones aún
            </q-card-section>
            </q-card>
        </div>

        <q-spinner
        v-if="trayendoInvitaciones"
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
import InvitacionEmpresaRepository from 'src/repositories/InvitacionEmpresa.repository';
import { useRouter, useRoute } from 'vue-router';
import { InvitacionEmpresaModel } from 'src/models/InvitacionEmpresa.model';
import ListadoInvitaciones from 'src/modules/Empresa/components/ListadoInvitaciones.vue'
import { useUsuarioStore } from 'src/stores/Usuario'
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore()
const { usuario } = storeToRefs(usuarioStore);

const invitacionEmpresaRepository = new InvitacionEmpresaRepository();
const empresaRepository = new EmpresaRepository();

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

onMounted(() => {
    getInvitacionEmpresa()
})

const invitaciones = ref<InvitacionEmpresaModel[] | null>(null)
const trayendoInvitaciones = ref<boolean>(false)
const getInvitacionEmpresa = async () => {


    try {
        trayendoInvitaciones.value = true;
        const response = await invitacionEmpresaRepository.get({ 
            email_invitado: usuario.value.email,
            invitador_id: usuario.value.id,
            incluir: ['rol', 'empresa', 'invitador', 'estado', 'invitado']
        });
        invitaciones.value = response;
    } catch (error) {
        
    } finally {
        trayendoInvitaciones.value = false;
    }
}

const modificandoInvitacion = ref<boolean>(false)
const eliminarInvitacion = async (invitacion: InvitacionEmpresaModel) => {
    if(modificandoInvitacion.value) return
    try {
        modificandoInvitacion.value = true;
        const response = await invitacionEmpresaRepository.eliminarEmpresa(invitacion.id);
        if(response && invitaciones.value){
            invitaciones.value = invitaciones.value.filter((i) => i.id !== invitacion.id)
            $q.notify({
                type: 'positive',
                message: 'Eliminado correctamente',
                position: 'bottom',
                timeout: 1500
            })
        }
    } catch (error) {
        
    } finally {
        modificandoInvitacion.value = false;
    }
}

const aceptarInvitacion = async (invitacion: InvitacionEmpresaModel) => {
    if(modificandoInvitacion.value) return
    try {
        modificandoInvitacion.value = true;
        const response = await invitacionEmpresaRepository.aceptarEmpresa(invitacion.id);
        if(response && invitaciones.value){
            let indexInvitacion = invitaciones.value.findIndex((i) => i.id === invitacion.id)
            if(indexInvitacion > -1){
                invitaciones.value[indexInvitacion] = response
                $q.notify({
                    type: 'positive',
                    message: 'Aceptado correctamente',
                    position: 'bottom',
                    timeout: 1500
                })
            }
        }
    } catch (error) {
        
    } finally {
        modificandoInvitacion.value = false;
    }
}

const rechazarInvitacion = async (invitacion: InvitacionEmpresaModel) => {
    if(modificandoInvitacion.value) return
    try {
        modificandoInvitacion.value = true;
        const response = await invitacionEmpresaRepository.rechazarEmpresa(invitacion.id);
        if(response && invitaciones.value){
            let indexInvitacion = invitaciones.value.findIndex((i) => i.id === invitacion.id)
            if(indexInvitacion > -1){
                invitaciones.value[indexInvitacion] = response
            }
            $q.notify({
                type: 'positive',
                message: 'Rechazado correctamente',
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