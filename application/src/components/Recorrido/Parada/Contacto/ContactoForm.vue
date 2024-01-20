<template>
    
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Tipo documento"
            color="deep-purple-6"
            v-model="contactoForm.tipo_documento_id" 
            :options="tiposDocumentos" 
            clearable 
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            :rules="[
                val => !!val || '* Debes elegir tipo documento',
            ]"
            
            />
        </div>

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-input 
            v-model="contactoForm.numero_documento" 
            color="deep-purple-6" 
            label="Numero documento"
            autocomplete="off"
            :rules="[
                val => !!val || '* Debes ingresar documento',
            ]"
            />
        </div>

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-input 
            v-model="contactoForm.nombre" 
            color="deep-purple-6" 
            label="Destinatario / Nombre"
            autocomplete="off"
            />
        </div>


        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-select 
            label="Codigo area"
            color="deep-purple-6"
            v-model="contactoForm.codigo_area_id" 
            :options="codigosArea" 
            clearable 
            option-label="codigo"
            option-value="id"
            emit-value
            map-options
            >
            <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                    <q-item-section>
                        <q-item-label>{{ scope.opt.codigo }}</q-item-label>
                    </q-item-section>
                    <q-item-section avatar>
                        <q-avatar>
                            <img :src="`https://flagsapi.com/${scope.opt.bandera}/flat/64.png`">
                        </q-avatar>
                    </q-item-section>
                </q-item>
            </template>
            </q-select>
        </div>

        <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
            <q-input 
            v-model="contactoForm.numero_celular" 
            color="deep-purple-6" 
            label="Numero celular"
            autocomplete="off"
            />
        </div>
    
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDataProvider } from 'src/composables/DataProvider'
import { ContactoRequestModel } from 'src/models/Contacto.model';

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const contactoForm = ref<ContactoRequestModel>({
    tipo_documento_id : 1,
    numero_documento: null,
    codigo_area_id: 1,
    nombre: null,
    numero_celular: null,
    numero_fijo: null,
})

const {
    getTipoDocumentos,
    tiposDocumentos,
    getCodigosArea,
    codigosArea,
} = useDataProvider()

onMounted(async() => {
    await getTipoDocumentos()
    await getCodigosArea()
})

defineExpose({
    contactoForm
})


</script>

<style scoped>

</style>