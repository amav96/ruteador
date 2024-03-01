<template>
    <div>
        <q-card flat  class=" bg-white text-white q-mb-md">
            <q-card-section @click="mostrarDialogFiltros = true" class="flex column q-pa-xs">
                <div class="flex row justify-between q-mb-xs q-mx-xs">
                    <div class="text-h6 text-black">
                    {{ fechaInicioFormateado }}
                    </div>

                    <div class="text-h5 text-black"> 
                        <q-icon name="arrow_drop_down"/>
                    </div>
                    
                    <div class="text-h6 text-black">{{ fechaFinFormateado }}</div>
                </div>
                <div v-if="filtros.empresa" class="text-black">
                    {{ filtros.empresa.nombre }}
                </div>
            </q-card-section>
        </q-card>

        <!-- desglose gestion -->
        <q-card  style="border-radius:15px;" flat  class=" bg-white text-white q-mx-sm rounded-xs">
            <q-card-section >
                <div class="text-h6 text-black">Desglose gestión de paquetes</div>
            </q-card-section>

            <q-list v-if="!trayendoInforme && metricas" bordered class="text-black">
                <q-item clickable v-ripple>
                    <q-item-section class="text-weight-medium" >Entregados</q-item-section>
                    <q-item-section avatar>
                        {{ metricas.entregados }} ({{ metricas.entregados_porcentaje }}) %
                    </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                    <q-item-section class="text-weight-medium" >Preparados</q-item-section>
                    <q-item-section avatar>
                        {{ metricas.preparados }} ({{ metricas.preparados_porcentaje }}) %
                    </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                    <q-item-section class="text-weight-medium" >Retirados</q-item-section>
                    <q-item-section avatar>
                        {{ metricas.retirados }} ({{ metricas.retirados_porcentaje }}) %
                    </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                    <q-item-section class="text-weight-medium" >No Entregados</q-item-section>
                    <q-item-section avatar>
                        {{ metricas.no_entregados }} ({{ metricas.no_entregados_porcentaje }}) %
                    </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                    <q-item-section class="text-weight-medium" >Cantidad</q-item-section>
                    <q-item-section avatar>
                        {{ metricas.item_cantidad }}
                    </q-item-section>
                </q-item>
                
                <div class="full-width flex justify-center">
                    <q-btn @click="router.push({name: 'listado-items', params: { usuario_id: usuario.id}})" style="width:92%;" class="bg-deep-purple-13"   >
                        <span class="text-white">Historial de paquetes</span>
                    </q-btn>
                </div>

                <q-card-section class="flex row items-center q-gutter-xs" >
                    <template v-if="descargandoInforme">
                        <q-spinner-oval
                        color="green"
                        class="q-ml-sm"
                        size="2em"
                        />
                        <div  class="text-black text-weight-medium"> Descargando informe... </div>
                    </template>
                    <template v-else>
                        <q-icon @click="descargarInforme" size="sm" color="green" name="summarize"/> 
                        <div @click="descargarInforme" class="text-black text-weight-medium"> Descargar informe </div>
                    </template>
                </q-card-section>
            </q-list>  
        </q-card>


    
        <q-dialog v-model="mostrarDialogFiltros" :position="'bottom'">
            <q-card style="width: 350px">
                <div class="flex column q-my-md">
                    <div class="flex row justify-between no-wrap ">
                        <q-input 
                        dense 
                        class="q-mb-sm full-width informe-input" 
                        v-model="filtros.fecha_inicio"
                        filled 
                        type="date" 
                        hint="Fecha inicio"  
                        />
                        <q-input 
                        dense 
                        class="q-mb-sm full-width informe-input" 
                        v-model="filtros.fecha_fin" 
                        filled 
                        type="date" 
                        hint="Fecha fin" 
                        />
                    </div>
                    <q-select
                    dense
                    class="q-mb-sm"
                    filled
                    label="Empresa"
                    color="deep-purple-6"
                    v-model="filtros.empresa"
                    :options="empresas"
                    option-label="nombre"
                    option-value="id"
                    clearable
                    @popup-hide="mostrarDialogFiltros = false;"
                    />
                </div>
            </q-card>
        </q-dialog>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeMount } from 'vue';
import {  MetricasItem, ItemPaginationModel } from 'src/models/Item.model';
// import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
// import  "@webzlodimir/vue-bottom-sheet/dist/style.css";
import { useDataProvider } from 'src/composables/DataProvider';
import debounce from 'src/utils/Debounce'
import { useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from 'src/stores/Usuario'
import Permisos  from 'src/utils/Permisos'
import { format, addDays } from 'date-fns';
import { Browser } from '@capacitor/browser';
import ItemRepository from 'src/repositories/Item.repository';
import { EmpresaModel } from 'src/models/Empresa.model';


interface Filtros {
    fecha_inicio: string;
    fecha_fin: string;
    empresa: EmpresaModel | null;
    page: number,
}

const route = useRoute();
const router = useRouter();

const usuarioId = computed(() => route.params.usuario_id )
const usuarioStore = useUsuarioStore()
const { usuario } = usuarioStore;

onBeforeMount(() => {
    if(usuario.id !== Number(usuarioId.value)){
        if(!usuario.permisos.some((p: string) => p === Permisos.ADMINISTRACION_USUARIOS_LISTADO)){
            router.push({name: 'listado-recorrido'})
        }
    }
})

const itemRepository = new ItemRepository();

const {
    empresas,
    getEmpresas,
} = useDataProvider()

onMounted(async () => {
    await getInformeItems()
    getEmpresas()
})

// @ts-ignore
const fechaActual = format(new Date(), 'yyyy-MM-dd', { timeZone: usuario.pais?.time_zone ?? 'America/Argentina/Buenos_Aires' });
const filtros = ref<Filtros>({
    fecha_inicio: fechaActual,
    fecha_fin: fechaActual,
    empresa: null,
    page: 1,
});
const mostrarDialogFiltros = ref<boolean>(false)

const fechaInicioFormateado = computed(() => {
    const fechaInicio = new Date(filtros.value.fecha_inicio);
    const options : any = { day: "numeric", month: "short", timeZone: "UTC" };
    return fechaInicio.toLocaleDateString('es-ES', options);
})

const fechaFinFormateado = computed(() => {
    const fechaFin = new Date(filtros.value.fecha_fin);
    const options : any = { day: "numeric", month: "short", timeZone: "UTC" };
    return fechaFin.toLocaleDateString('es-ES', options);
})

const metricas = ref<MetricasItem | null>(null);
const items = ref<ItemPaginationModel | null>(null)
const trayendoInforme = ref<boolean>(false)
const getInformeItems = async () => {
    try {
        trayendoInforme.value = true;
        const response = await itemRepository.getInformeItems({
            ...{
                ...filtros.value,
                empresa_id: (filtros.value.empresa?.id ?? null)
            },
            incluir: ["ItemEstado","cliente","parada", "itemProveedor" , "itemTipo"],
            rider_id: usuario.id
        });
        const { metricas: metricasServer, items: itemsServer } = response;
        metricas.value = metricasServer;
        items.value = itemsServer;
        
    } catch (error) {
        
    } finally {
        trayendoInforme.value = false;
    }
};
const debouncedGetInformeItems = debounce(getInformeItems, 350);

const fechaInicioObserver = computed(() => filtros.value.fecha_inicio)
watch(fechaInicioObserver, (value: string) => {
        if(value) debouncedGetInformeItems();
    }
);

const fechaFinObserver = computed(() => filtros.value.fecha_fin)
watch(fechaFinObserver,(value: string) => {
        if(value)debouncedGetInformeItems();
    }
);

const empresaObserver = computed(() => filtros.value.empresa)
watch(empresaObserver,(value: EmpresaModel | null) => {
        if(value) debouncedGetInformeItems();
    }
);


const descargandoInforme = ref<boolean>(false);
const descargarInforme = async () => {
    try {
        descargandoInforme.value = true;
        const response = await itemRepository.getInformeItemsExcel({
            ...{
                ...filtros.value,
                empresa_id: (filtros.value.empresa?.id ?? null)
            },
            incluir: ["ItemEstado","cliente","parada", "itemProveedor" , "itemTipo"],
            rider_id: usuario.id
        });
        const { url } = response;
        if(url){
            openCapacitorSite(url)
        }
    } catch (error) {
        
    } finally {
        setTimeout(() => {
            descargandoInforme.value = false;
        }, 1000);
    }
}

const openCapacitorSite = async (url: string) => {
    await Browser.open({ url, presentationStyle: 'popover' });
};

</script>

<style >
.informe-input .q-field__messages{
    font-size: 13px !important;
}
</style>