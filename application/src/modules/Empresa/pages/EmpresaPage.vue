<template>
    <q-page class="full-height flex column q-pa-md contenedor-section">
        <div  :style="`padding: 10px; ${ !breakpoint.xs? 'margin-top: 20px; border-radius: 15px;' : ''}`">
            <q-btn 
            v-if="!trayendoEmpresas && (!empresas ||  (empresas?.length === 0))"
            outline 
            color="primary" 
            label="Crear empresa" 
            icon-right="add" 
            @click="abrirSaveEmpresa = !abrirSaveEmpresa" 
            />

            <template v-if="empresas && empresas.length > 0">
                <div class="text-h6">
                    Mis empresas
                </div>

                <q-card 
                style="border-radius:10px;" 
                flat  
                class="bg-white text-white rounded-xs q-mt-md flex row no-wrap justify-around"
                v-for="(empresa, index) in empresas"
                :key="index"
                >
                    <q-list  bordered class="full-width text-black q-my-sm q-py-xs flex column">
                        <div class="flex row justify-between">
                            <div>
                                <q-item class="item-list" >
                                    <q-item-section class="text-weight-medium" > {{ empresa.nombre }} </q-item-section>
                                </q-item>
                                <q-item class="item-list" >
                                    <q-item-section  > <span class="text-weight-medium"> Creada </span> {{ empresa.created_at.substring(0,10) }}  </q-item-section>
                                </q-item>
                            </div>
                            <div class="flex column">
                                <q-item class="item-list" >
                                    <q-item-section class="text-weight-medium" > 
                                        <q-btn @click="router.push({name: 'invitaciones-empresa'})" outline size="md" color="black" label="Ver invitaciones" />
                                    </q-item-section>
                                </q-item>
                                <q-item class="item-list" >
                                    <q-item-section class="text-weight-medium" > 
                                        <q-btn @click="router.push({name: 'usuarios-empresa', params: { empresa_id: empresa.id }})"  outline color="black" label="Ver usuarios" />
                                    </q-item-section>
                                </q-item>
                            </div>
                        </div>
                        <q-item class="item-list" >
                            <q-item-section class="text-weight-medium" > 
                                <q-btn 
                                outline 
                                color="primary" 
                                label="Invitar usuario" 
                                icon-right="add" 
                                @click="abrirModalInvitarUsuario(empresa)"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list> 
                
                </q-card>

            </template>
        </div>

        <q-dialog
        v-model="modalInvitarUsuario"
        persistent
        :maximized="breakpoint.xs"
        position="standard"
        transition-show="slide-up"
        transition-hide="slide-down"
        >
            <invitar-usuarios
            v-if="empresaActual"
            :empresa-id="empresaActual.id"
            @close="cerrarModalInvitarUsuario"
            />
        </q-dialog>
        
        <q-dialog
        v-model="abrirSaveEmpresa"
        persistent
        :maximized="true"
        transition-show="slide-up"
        transition-hide="slide-down"
        >
            <save-empresa
            @close="abrirSaveEmpresa = false"
            @empresa-creada="empresaCreada"
            />
        </q-dialog>

        <router-view/>
    </q-page>
</template>

<script setup lang="ts">
import { EmpresaModel } from 'src/models/Empresa.model';
import SaveEmpresa from 'src/modules/Empresa/components/SaveEmpresa.vue'
import InvitarUsuarios from 'src/modules/Empresa/components/InvitarUsuarios.vue'
import EmpresaRepository from 'src/repositories/Empresa.repository';
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { routerKey, useRouter } from 'vue-router';

const router = useRouter();

const empresaRepository = new EmpresaRepository();

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

onMounted(() => {
    getEmpresas();
})

const abrirSaveEmpresa = ref<boolean>(false);
const empresas = ref<EmpresaModel[] | null>(null)
const trayendoEmpresas = ref<boolean>(false)
const getEmpresas = async () => {
    try {
        trayendoEmpresas.value = true;
        const response = await empresaRepository.get();
      
        if(response && response.length > 0){
            empresas.value = response
        }
       
    } catch (error) {
        console.log(error)
    } finally {
        trayendoEmpresas.value = false;
    }
}

const empresaCreada = (empresa: EmpresaModel) => {
    empresas.value = [empresa]
}

const modalInvitarUsuario = ref<boolean>(false);
const empresaActual = ref<EmpresaModel | null>(null)
const abrirModalInvitarUsuario = (empresa: EmpresaModel) => {
    empresaActual.value = empresa
    modalInvitarUsuario.value = true
}

const cerrarModalInvitarUsuario = () => {
    empresaActual.value = null
    modalInvitarUsuario.value = false
}

</script>

<style scoped>

</style>