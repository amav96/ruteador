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
            v-model="itemForm.proveedor_item_id" 
            :options="proveedoresItems" 
            clearable 
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
            v-model="itemForm.tipo_item_id" 
            :options="tiposItems" 
            clearable 
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
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDataProvider } from 'src/composables/DataProvider'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { onBeforeMount } from 'vue';
import { ItemRequestModel } from 'src/models/Item.model';
import { useUsuarioStore } from 'src/stores/Usuario'

const usuarioStore = useUsuarioStore()

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const itemForm = ref<ItemRequestModel>({
    track_id: null,
    empresa_id : 1,
    tipo_item_id: 1,
    proveedor_item_id: 1
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

    getTiposItems,
    tiposItems,
    getProveedoresItems,
    proveedoresItems
} = useDataProvider()

onMounted(async() => {
    await getTiposItems()
    await getProveedoresItems()
})

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