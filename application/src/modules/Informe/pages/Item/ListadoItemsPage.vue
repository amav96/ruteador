<template>
     <q-layout view="hHh Lpr lff" class="AppRoot-fullPage bg-grey-2">
        <q-page-container class="AppMain__layer__PageAndTopBar">
            <div class="flex column no-wrap full-height">
        
            <q-input
            v-model="filtros.busqueda"
            placeholder="Ingrese busqueda"
            type="text"
            rounded 
            outlined 
            class="q-pa-md bg-white"
            color="deep-purple-13"
            clearable
            >
            
            <template v-slot:prepend>
                <q-icon @click="router.push({name: 'items-tablero', params: { usuario_id: usuario.id}})"  name="arrow_back" />
            </template>
            </q-input>
        
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

            <div v-if="trayendoItems && items.length === 0" class="flex row justify-center full-width items-center q-mt-sm">
                <q-spinner-ios
                color="primary"
                size="2em"
                />
                <div class="q-ml-sm"> Cargando </div>
            </div>

            <div
            v-if="!trayendoItems && items.length === 0 "
            class="flex justify-center"
            >
                No hay resultados para esta busqueda
            </div>

            <q-scroll-area
            v-if="items"
            style=""  
            class="flex column no-wrap full-height"
            @scroll="scrolling"
            >
                <listado-item 
                :items="items"
                @item="abrirDialogDetalle($event)"
                 />
            </q-scroll-area>
            
            <div v-if="trayendoItems && items.length > 0" class="flex row justify-center full-width items-center q-mt-sm">
                <q-spinner-ios
                color="primary"
                size="2em"
                />
                <div class="q-ml-sm"> Cargando </div>
            </div>

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
                            color="deep-purple-13"
                            />
                            <q-input 
                            dense 
                            class="q-mb-sm full-width informe-input" 
                            v-model="filtros.fecha_fin" 
                            filled 
                            type="date" 
                            hint="Fecha fin" 
                            color="deep-purple-13"
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

            <q-dialog
            v-model="dialogoItemDetalle"
            persistent
            :maximized="true"
            transition-show="slide-up"
            transition-hide="slide-down"
            >
                <item 
                v-if="itemDetalle"
                :item="itemDetalle"
                @close="cerrarDialogDetalle"
                 />
            </q-dialog>

            </div>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeMount } from 'vue';
import {  ItemPaginationModel, ItemModel } from 'src/models/Item.model';
import { useDataProvider } from 'src/composables/DataProvider';
import debounce from 'src/utils/Debounce'
import { useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from 'src/stores/Usuario'
import Permisos  from 'src/utils/Permisos'
import { format, addDays } from 'date-fns';
import ItemRepository from 'src/repositories/Item.repository';
import { EmpresaModel } from 'src/models/Empresa.model';
import ListadoItem from 'src/modules/Informe/components/Item/ListadoItem.vue';
import { nextTick } from 'vue';
import Item from 'src/modules/Informe/components/Item/Item.vue'

interface Filtros {
    fecha_inicio: string;
    fecha_fin: string;
    empresa: EmpresaModel | null;
    page: number,
    busqueda: string,
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
    await getItems()
    getEmpresas()
})


// @ts-ignore
const fechaInicial = format(addDays(new Date(), -7), 'yyyy-MM-dd', { timeZone: usuario.pais?.time_zone ?? 'America/Argentina/Buenos_Aires' });
// @ts-ignore
const fechaFinal = format(new Date(), 'yyyy-MM-dd', { timeZone: usuario.pais?.time_zone ?? 'America/Argentina/Buenos_Aires' });
const filtros = ref<Filtros>({
    fecha_inicio: fechaInicial,
    fecha_fin: fechaFinal,
    empresa: null,
    page: 1,
    busqueda: '',
});
const next_page_url = ref<string | null>(null)
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

const items = ref<ItemModel[] | []>([])
const trayendoItems = ref<boolean>(false)
const getItems = async () => {
    try {
        if(filtros.value.page === 1 && items.value.length > 0){
            items.value = []
        }
        const obj = {
            ...{
                ...filtros.value,
                empresa_id: (filtros.value.empresa?.id ?? null)
            },
            incluir: ["itemEstado","cliente.clientesNumeros","parada", "itemProveedor" , "itemTipo", "comprobantes"],
            creado_por: usuario.id
        }
      
        trayendoItems.value = true;
        const response = await itemRepository.get("",obj) as unknown as ItemPaginationModel;
        items.value = [... items.value,...response.data];
        next_page_url.value = response.next_page_url
        
    } catch (error) {

    } finally {
        trayendoItems.value = false;
    }
};
const debouncedGetItems = debounce(getItems, 500);

const fechaInicioObserver = computed(() => filtros.value.fecha_inicio)
watch(fechaInicioObserver, (value: string) => {
        if(value) {
            filtros.value.page = 1;
            debouncedGetItems();
        }
    }
);

const fechaFinObserver = computed(() => filtros.value.fecha_fin)
watch(fechaFinObserver,(value: string) => {
        if(value) {
            filtros.value.page = 1;
            debouncedGetItems();
        }
    }
);

const empresaObserver = computed(() => filtros.value.empresa)
watch(empresaObserver,(value: EmpresaModel | null) => {
        if(value) {
            filtros.value.page = 1;
            debouncedGetItems();
        }
    }
);

const busquedaObserver = computed(() => filtros.value.busqueda)
watch(busquedaObserver, (value: string) => {
    filtros.value.page = 1;
    debouncedGetItems();
})


const scrolling = async (data: any) => {
    let position = data.ref.getScrollPercentage();
    if(position.top === 1 && !trayendoItems.value && next_page_url.value){
        filtros.value.page ++
        await nextTick()
        await getItems()
    }
   
}

const dialogoItemDetalle = ref<boolean>(false)
const itemDetalle = ref<ItemModel | null>(null)
const abrirDialogDetalle = (item: ItemModel) => {
    itemDetalle.value = item;
    dialogoItemDetalle.value = true
}

const cerrarDialogDetalle = () => {
    itemDetalle.value = null;
    dialogoItemDetalle.value = false
}

</script>

<style >
.informe-input .q-field__messages{
    font-size: 13px !important;
}
</style>