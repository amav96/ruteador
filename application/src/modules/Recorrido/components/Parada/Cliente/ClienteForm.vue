<template>
    
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

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose, toRefs } from 'vue';
import { useQuasar } from 'quasar'
import { useDataProvider } from 'src/composables/DataProvider'
import { ClienteModel } from 'src/models/Cliente.model';
import ClienteRepository from 'src/repositories/Cliente.repository'

const props = withDefaults(defineProps<{cliente_id?: number | string | null}>(), {
  cliente_id: null,
});

const {
    cliente_id
} = toRefs(props);

const clienteRepository = new ClienteRepository();

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const clienteForm = ref<ClienteModel>({
    tipo_documento_id : 1,
    numero_documento: null,
    nombre: null,
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
    await getTipoDocumentos()
    await getCodigosArea()
    if(cliente_id.value){
        await getCliente()
    }
})

const getCliente = async () => {
    if(cliente_id.value){
       try {
        const response = await clienteRepository.get(cliente_id.value, { incluir : ['clientesNumeros']})
        const [cliente] = response;
        if(cliente){
            clienteForm.value.tipo_documento_id = cliente.tipo_documento_id
            clienteForm.value.numero_documento = cliente.numero_documento
            clienteForm.value.nombre = cliente.nombre
            const { clientes_numeros } = cliente;
            clientesNumerosForm.value = []
            clientes_numeros?.forEach((n) => {
                clientesNumerosForm.value.push({
                    id: n.id,
                    codigo_area_id: n.codigo_area_id,
                    numero: n.numero
                })
            })
        }
       } catch (error) {
        
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