<template>
    
    <skeleton-item :mostrar="trayendoItem" />
    <template v-if="!trayendoItem">

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-input 
            v-model="itemForm.track_id" 
            color="deep-purple-6" 
            label="Numero envio"
            autocomplete="off"
            >
            </q-input>
        </div>
        
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Agencia paqueteria"
            color="deep-purple-6"
            v-model="itemForm.empresa_id" 
            :options="empresas" 
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            :rules="[
                val => !!val || '* Empresa obligatoria',
            ]"
            />
        </div>

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Proovedor"
            color="deep-purple-6"
            v-model="itemForm.item_proveedor_id" 
            :options="proveedoresItems" 
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            :rules="[
                val => !!val || '* Proveedor obligatorio',
            ]"
            />
        </div>

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Tipo paquete"
            color="deep-purple-6"
            v-model="itemForm.item_tipo_id" 
            :options="itemsTipos" 
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            :rules="[
                val => !!val || '* Tipo de paquete obligatorio',
            ]"
            />
        </div>

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width', 'flex row no-wrap']" >
            <q-input label="Estimativo" v-model="day" class="full-width" type="date"  />
            <q-input label="llegada" v-model="time" class="full-width" type="time" />
        </div>

        <!-- <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Estado"
            color="deep-purple-6"
            v-model="itemForm.item_estado_id" 
            :options="itemEstadosFiltrados" 
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            :rules="[
                val => !!val || '* Tipo de paquete obligatorio',
            ]"
            />
        </div> -->
    </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { useDataProvider } from 'src/composables/DataProvider'
import { ItemEstadoModel, ItemRequestModel, ItemModel } from 'src/models/Item.model';
import { useUsuarioStore } from 'src/stores/Usuario'
import { toRefs } from 'vue';
import ItemRepository from 'src/repositories/Item.repository'
import SkeletonItem from 'src/modules/Recorrido/components/Parada/Item/SkeletonItem.vue'
import { ITEMS_ESTADOS } from 'src/utils/DataProviders';
import { getDiaActual } from 'src/utils/Util';

const emit = defineEmits<{
  (e: 'formularioCargado', data: boolean ): void
}>()

const itemRepository = new ItemRepository()

interface Props {
    item_id?: number | string | null
    item?: ItemModel | null
}

const props = withDefaults(defineProps<Props>(), {
  item_id: null,
  item: null
});

const {
    item_id,
    item
} = toRefs(props);

const usuarioStore = useUsuarioStore()

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)


const time = ref('')
const day = ref(getDiaActual())

const itemForm = ref<ItemRequestModel>({
    track_id: null,
    empresa_id : 1,
    item_tipo_id: 1,
    item_proveedor_id: 1,
    item_estado_id: ITEMS_ESTADOS.PREPARADO,
})

const {
    getItemsTipos,
    itemsTipos,
    getProveedoresItems,
    proveedoresItems,
    itemsEstados,
    getItemsEstados,
    getEmpresas,
    empresas,
} = useDataProvider()

onMounted(async() => {
    emit("formularioCargado", true)
    await getItemsTipos()
    await getProveedoresItems()
    await getItemsEstados()
    await getEmpresas()
    
    // Solo para editar
    await getItem();

    if(item.value){
        autoCompletarItem()
    } else {
        await getUltimoItem()
    }
})

const autoCompletarItem = () => {
    if(item.value){
        const { item_estado_id, item_proveedor_id, item_tipo_id, track_id } = item.value
        if(item_estado_id) itemForm.value.item_estado_id = item_estado_id
        if(item_proveedor_id) itemForm.value.item_proveedor_id = item_proveedor_id
        if(item_tipo_id) itemForm.value.item_tipo_id = item_tipo_id
        if(track_id) itemForm.value.track_id = track_id
    }
}

const trayendoItem = ref<boolean>(true)
const getItem = async () => {
    if(item_id.value){
        try {
            trayendoItem.value = true;
            emit("formularioCargado", true)
            const response = await itemRepository.get(item_id.value, { rider_id: usuarioStore.usuario.id , incluir: ['parada']});
            if(response.length > 0){
                const [ item ] = response;
                const { hora_llegada_estimada } = item.parada;
                if(hora_llegada_estimada){
                    let horaLlegadaDividido = hora_llegada_estimada.split(" ")
                    day.value = horaLlegadaDividido[0]
                    time.value = horaLlegadaDividido[1]
                }
                itemForm.value.track_id = item.track_id
                itemForm.value.empresa_id = item.empresa_id
                itemForm.value.item_tipo_id = item.item_tipo_id
                itemForm.value.item_proveedor_id = item.item_proveedor_id
                itemForm.value.destinatario = item.destinatario
                itemForm.value.item_estado_id = item.item_estado_id
            }
        } catch (error) {
            
        } finally {
            trayendoItem.value = false;
            emit("formularioCargado", false)
        }
    } else {
        trayendoItem.value = false;
        emit("formularioCargado", false)
    }
}

const getUltimoItem = async () => {
   try {
    const response = await itemRepository.getUltimoItem({usuario_id : usuarioStore.usuario.id});
    if(response.empresa_id){
        itemForm.value.empresa_id = response.empresa_id
    }
   } catch (error) {
    
   }
    
}

defineExpose({
    itemForm,
    time,
    day
})

</script>

<style>

body.barcode-scanner-active {
  visibility: hidden;
}

.barcode-scanner-modal {
  visibility: visible;
}

.barcode-hide{
    background: red;
    z-index: 9999;
    position: absolute;
}



</style>