<template>
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-input 
            v-model="itemForm.track_id" 
            color="deep-purple-6" 
            label="Numero envio"
            autocomplete="off"
            >
                <template v-slot:append>
                    <q-icon @click="startScan" name="qr_code_scanner" />
                </template>
            </q-input>
        </div>
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Agencia paqueteria"
            color="deep-purple-6"
            v-model="itemForm.empresa_id" 
            :options="usuarioStore.usuario.empresas" 
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

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
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
        </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { useDataProvider } from 'src/composables/DataProvider'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { onBeforeMount } from 'vue';
import { ItemEstadoModel, ItemRequestModel } from 'src/models/Item.model';
import { useUsuarioStore } from 'src/stores/Usuario'
import { toRefs } from 'vue';
import ItemRepository from 'src/repositories/Item.repository'

const itemRepository = new ItemRepository()

const props = withDefaults(defineProps<{item_id?: number | string | null}>(), {
  item_id: null,
});

const {
    item_id
} = toRefs(props);

const usuarioStore = useUsuarioStore()

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const itemForm = ref<ItemRequestModel>({
    track_id: null,
    empresa_id : 1,
    item_tipo_id: 1,
    item_proveedor_id: 1,
    item_estado_id: 1
})

const startScan = async () => {
  // Check camera permission
  // This is just a simple example, check out the better checks below
  await BarcodeScanner.checkPermission({ force: true });

  // make background of WebView transparent
  // note: if you are using ionic this might not be enough, check below
  BarcodeScanner.hideBackground();

  const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

  // if the result has content
  if (result.hasContent) {
    alert(JSON.stringify(result.content)); // log the raw scanned content

  }
};

const stopScan = () => {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
};;

onBeforeMount(() => {
    stopScan()
})

const {

    getItemsTipos,
    itemsTipos,
    getProveedoresItems,
    proveedoresItems,
    itemsEstados,
    getItemsEstados
} = useDataProvider()

onMounted(async() => {
    await getItemsTipos()
    await getProveedoresItems()
    await getItemsEstados()
    // Solo para editar
    await getItem();
})

const itemEstadosFiltrados = computed(() => itemsEstados.value.filter((i: ItemEstadoModel) => i.tipo === 'positivo'))

const getItem = async () => {
    if(item_id.value){
        const response = await itemRepository.get(item_id.value);
        if(response.length > 0){
            const [ item ] = response;
            itemForm.value.track_id = item.track_id
            itemForm.value.empresa_id = item.empresa_id
            itemForm.value.item_tipo_id = item.item_tipo_id
            itemForm.value.item_proveedor_id = item.item_proveedor_id
            itemForm.value.destinatario = item.destinatario
            itemForm.value.item_estado_id = item.item_estado_id
        }
        
    }
}

defineExpose({
    itemForm
})


</script>

<style>

body.barcode-scanner-active {
  visibility: hidden;
}

.barcode-scanner-modal {
  visibility: visible;
}

</style>