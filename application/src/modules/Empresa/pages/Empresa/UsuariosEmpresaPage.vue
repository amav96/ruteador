<template>
    <q-dialog 
        v-model="openModal" 
        persistent
        :maximized="true"
        >
            <q-card class="bg-grey-1">
                
                <div class="full-height flex column no-wrap q-pa-md contenedor-section ">
                    <div 
                    class="full-width q-mb-sm"
                    >
                        <q-icon 
                        name="arrow_back" 
                        color="deep-purple-13"
                        size="sm"
                        @click="router.push({name: 'empresas'})"
                        />
                    </div>

                    <div class="text-h6">
                        Usuarios 
                    </div>

                    <div class="flex column no-wrap justify-center" v-if="usuariosEmpresas && usuariosEmpresas.length > 0">
                        <listado-usuarios-empresas
                        :usuarios-empresas="usuariosEmpresas"
                        :campos-mostrar=" ['invitador' ,'invitado' ,'rol' ,'estado', 'usuario']"
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
                
                    <div v-if="!trayendoUsuariosEmpresas && usuariosEmpresas && usuariosEmpresas?.length > 0" class="flex justify-center q-my-sm">
                        <q-pagination
                        v-model="pagination.page"
                        :max="pagination.last_page"
                        max-page="10"
                        direction-links
                        />
                    </div>
                </div>
            </q-card>
            

       
    </q-dialog>
       
</template>

<script setup lang="ts">
import EmpresaRepository from 'src/repositories/Empresa.repository';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import UsuarioEmpresaRepository from 'src/repositories/UsuarioEmpresa.repository';
import { useRouter, useRoute } from 'vue-router';
import { InvitacionEmpresaModel } from 'src/models/InvitacionEmpresa.model';
import ListadoUsuariosEmpresas from 'src/modules/Empresa/components/ListadoUsuariosEmpresas.vue'
import { useUsuarioStore } from 'src/stores/Usuario'
import { storeToRefs } from 'pinia';
import UsuarioPage from 'src/modules/Usuario/pages/UsuarioPage.vue';
import { UsuarioEmpresaModel } from 'src/models/UsuarioEmpresa.model';
import { isRegularExpressionLiteral } from 'typescript';
import { ErrorModel, PaginationModel } from 'src/models/Helper.model';
import { ROLES } from 'src/utils/DataProviders';

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

const openModal = ref<boolean>(true)

const empresaId = computed(() => route.params.empresa_id)

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
        getUsuariosEmpresas();
    }
})

const usuariosEmpresas = ref<UsuarioEmpresaModel[] | null>(null)
const trayendoUsuariosEmpresas = ref<boolean>(false)
const getUsuariosEmpresas = async () => {

    try {
        trayendoUsuariosEmpresas.value = true;
        const response = await usuarioEmpresaRepository.get({ 
            page: pagination.page,
            empresa_id: empresaId.value,
            
            incluir: ['rol', 'empresa', 'usuario', 'invitacion.invitador'],
            eliminadas: true
        });
        
        const { data, current_page, total, last_page, next_page_url, prev_page_url } = response as unknown as PaginationModel<UsuarioEmpresaModel>
            usuariosEmpresas.value = data
            pagination.page = current_page
            pagination.total = total
            pagination.last_page = last_page
            pagination.next_page_url = next_page_url
            pagination.prev_page_url = prev_page_url

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
        console.log(response)
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
    } catch (error : unknown) {
        const errors = error as ErrorModel

        $q.notify({
            type: 'negative',
            message: `${errors.data?.message ?? 'No se puede enviar invitacion'}`,
            position: 'bottom',
            timeout: 3000
        })
        
    } finally {
        modificandoInvitacion.value = false;
    }
}



</script>

<style scoped>

</style>