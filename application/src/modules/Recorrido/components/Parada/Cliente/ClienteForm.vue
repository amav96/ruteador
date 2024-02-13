<template>
        <skeleton-cliente :mostrar="trayendoCliente" />
        <template v-if="!trayendoCliente">
            <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
                <q-select
                label="Tipo documento"
                color="deep-purple-6"
                v-model="clienteForm.tipo_documento_id"
                :options="tiposDocumentos"
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
                v-model="clienteForm.numero_documento"
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
                v-model="clienteForm.nombre"
                color="deep-purple-6"
                label="Destinatario / Nombre"
                autocomplete="off"
                />
            </div>

            <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
                <q-input
                v-model="clienteForm.observaciones"
                color="deep-purple-6"
                label="Observaciones"
                autocomplete="off"
                type="textarea"
                autogrow
                />
            </div>

            <template
            v-for="(item,index) in clientesNumerosForm"
            :key="index"
            >
                <div :class="[breakpoint.xs ? 'full-width' : 'media-width']" >
                    <q-select
                    label="Codigo area"
                    color="deep-purple-6"
                    v-model="item.codigo_area_id"
                    :options="codigosArea"
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
                    v-model="item.numero"
                    color="deep-purple-6"
                    label="Numero celular"
                    autocomplete="off"
                    />
                </div>
            </template>
        </template>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose, toRefs } from 'vue';
import { useQuasar } from 'quasar'
import { useDataProvider } from 'src/composables/DataProvider'
import { ClienteModel } from 'src/models/Cliente.model';
import ClienteRepository from 'src/repositories/Cliente.repository'
import SkeletonCliente from 'src/modules/Recorrido/components/Parada/Cliente/SkeletonCliente.vue'

const emit = defineEmits<{
  (e: 'formularioCargado', data: boolean ): void
}>()

interface Props {
    cliente_id?: number | string | null
    cliente?: ClienteModel | null
}

const props = withDefaults(defineProps<Props>(), {
  cliente_id: null,
  cliente: null
});

const {
    cliente_id,
    cliente
} = toRefs(props);

const clienteRepository = new ClienteRepository();

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const clienteForm = ref<ClienteModel>({
    tipo_documento_id : 1,
    numero_documento: null,
    nombre: null,
    observaciones: null
})

const clientesNumerosForm = ref<any>([
    {
        id: null,
        codigo_area_id: 1,
        numero: null
    }
])

const {
    getTipoDocumentos,
    tiposDocumentos,
    getCodigosArea,
    codigosArea,
} = useDataProvider()

onMounted(async() => {
    emit("formularioCargado", true)
    await getTipoDocumentos()
    await getCodigosArea()
    // edicion
    if(cliente_id.value){
        await getCliente()
    } else {
        trayendoCliente.value = false
        emit("formularioCargado", false)
    }
    // creacion asistida
    if(cliente.value){
        autoCompletarCliente()
    }
})

const autoCompletarCliente = () => {
    if(cliente.value){
        const { clientes_numeros, nombre, numero_documento,  observaciones, tipo_documento_id } = cliente.value
        // if(codigo_area_id) clienteForm.value.codigo_area_id = codigo_area_id
        if(nombre) clienteForm.value.nombre = nombre
        if(numero_documento) clienteForm.value.numero_documento = numero_documento
        if(observaciones) clienteForm.value.observaciones = observaciones
        if(tipo_documento_id) clienteForm.value.tipo_documento_id = tipo_documento_id
        if(clientes_numeros){
            clientesNumerosForm.value = clientes_numeros
        }
    }
}

const trayendoCliente = ref<boolean>(true)
const getCliente = async () => {
    if(cliente_id.value){
       try {
        trayendoCliente.value = true
        emit("formularioCargado", true)
        const response = await clienteRepository.get(cliente_id.value, { incluir : ['clientesNumeros']})
        const [cliente] = response;
        if(cliente){
            clienteForm.value.tipo_documento_id = cliente.tipo_documento_id
            clienteForm.value.numero_documento = cliente.numero_documento
            clienteForm.value.nombre = cliente.nombre
            clienteForm.value.observaciones = cliente.observaciones
            const { clientes_numeros } = cliente;
            if(clientes_numeros && clientes_numeros?.length > 0){
                clientesNumerosForm.value = []
                clientes_numeros?.forEach((n) => {
                    clientesNumerosForm.value.push({
                        id: n.id,
                        codigo_area_id: n.codigo_area_id,
                        numero: n.numero
                    })
                })
            }
        }
       } catch (error) {

       } finally {
        trayendoCliente.value = false
        emit("formularioCargado", false)
       }
    }

}

defineExpose({
    clienteForm,
    clientesNumerosForm
})


</script>

<style scoped>

</style>