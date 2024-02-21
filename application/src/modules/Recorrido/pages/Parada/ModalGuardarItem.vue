<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
    <q-card class="text-black flex justify-between column no-wrap items-center" >
        <div class="q-mb-md full-width q-pa-sm">
            <q-icon 
            @click="router.push({name: 'parada'})" 
            name="arrow_back" 
            color="deep-purple-13"
            size="sm"
            />
        </div>
        <div style="flex: 1;overflow: auto;" class="text-black flex column no-wrap full-width">
            
            <div    
            :class="['q-pa-sm flex row justify-between text-weight-bold text-h6 q-mb-xs cursor-pointer', breakpoint.xs ? 'full-width' : '']">
                <div
                @click="mostrarInformacionPaquete = !mostrarInformacionPaquete" 
                >
                    Paquete
                </div>
                <div>
                    <q-icon 
                    @click="mostrarInformacionPaquete = !mostrarInformacionPaquete" 
                    :name="`${mostrarInformacionPaquete ? 'expand_more' : 'expand_less' }`" 
                    />
                </div>
            </div>

            <div class="q-pa-sm full-width justify-center items-center flex column" v-show="mostrarInformacionPaquete">
                <form-item 
                :item_id="route.params.item_id as string ?? null"
                @formulario-cargado="cargandoFomularios = $event"
                ref="formItemRef"
                /> 
            </div>
            
            <div 
            :class="['q-pa-sm flex row justify-between text-weight-bold text-h6 q-my-lg cursor-pointer', breakpoint.xs ? 'full-width' : '']">
                <div 
                @click="mostrarInformacionContacto = !mostrarInformacionContacto" 
                >
                    Contacto
                </div>
                <div>
                    <q-icon 
                    @click="mostrarInformacionContacto = !mostrarInformacionContacto" 
                    :name="`${mostrarInformacionContacto ? 'expand_more' : 'expand_less' }`" 
                    />
                </div>
            </div>
    
            <div class="q-pa-sm full-width justify-center items-center flex column" v-show="mostrarInformacionContacto">
                <cliente-form 
                :cliente_id="route.params.cliente_id as string ?? null"
                @formulario-cargado="cargandoFomularios = $event"
                ref="formContactoRef"
                /> 
            </div>
        </div>
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-lg q-pa-sm']" >
            <q-btn
            unelevated 
            rounded 
            color="deep-purple-13"
            label="Guardar" 
            type="buttom"
            class="full-width"
            @click="manejarData"
            :disabled="guardandoCliente || guardandoItem || cargandoFomularios"
            />
        </div>
    </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import FormItem from 'src/modules/Recorrido/components/Parada/Item/FormItem.vue'
import ClienteForm from 'src/modules/Recorrido/components/Parada/Cliente/ClienteForm.vue'

import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute, routerKey } from 'vue-router'
import { useQuasar } from 'quasar'
import { ItemRequestModel } from 'src/models/Item.model';
import { ClienteRequestModel, ClienteModel } from 'src/models/Cliente.model';
import { useUsuarioStore } from 'src/stores/Usuario'
import ItemRepository from 'src/repositories/Item.repository'
import ClienteRepository from 'src/repositories/Cliente.repository'

const emit = defineEmits<{
  (e: 'actualizarParada', data: boolean): void
}>()

const itemRepository = new ItemRepository()
const clienteRepository = new ClienteRepository();

const usuarioStore = useUsuarioStore()

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const route = useRoute();
const router = useRouter();

const mostrarInformacionContacto = ref<boolean>(true)
const mostrarInformacionPaquete = ref<boolean>(true)

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const formItemRef = ref<any>(null)
const formContactoRef = ref<any>(null)
console.log(route.params)
const isItemEditMode = computed(() => route.name === 'editar-item-cliente' && !!route.params.item_id)
const isClienteEditMode = computed(() => route.name === 'editar-item-cliente' && !!route.params.cliente_id)

const itemForm = ref<ItemRequestModel | null>(null)
const clienteForm = ref<ClienteRequestModel | null>(null)
const clientesNumerosForm = ref<any>(null)

const guardandoCliente = ref<boolean>(false)
const guardandoItem = ref<boolean>(false)

const cargandoFomularios = ref<boolean>(false)
const manejarData = async () => {

    const {
        usuario : { id: usuarioId }
    } = usuarioStore

    if(formItemRef.value && 'itemForm' in formItemRef.value){
        itemForm.value = formItemRef.value.itemForm
    }

    if(formContactoRef.value && 'clienteForm' in formContactoRef.value){
        clienteForm.value = formContactoRef.value.clienteForm
        clientesNumerosForm.value = formContactoRef.value.clientesNumerosForm
    }

    if(clienteForm.value && itemForm.value && usuarioId) {
      
        itemForm.value.rider_id = usuarioId
        itemForm.value.parada_id = Number(route.params.parada_id) 

        clienteForm.value.empresa_id = itemForm.value.empresa_id

        itemForm.value.destinatario = clienteForm.value.nombre ?? itemForm.value.destinatario
        clienteForm.value.nombre = itemForm.value.destinatario ?? clienteForm.value.nombre

        if(clienteGuardable()){
            const guardarCliente = isClienteEditMode.value 
                                    ? await actualizarCliente() 
                                    : await crearCliente()
            if(guardarCliente){
                isItemEditMode.value 
                    ? await actualizarItem(guardarCliente.id) 
                    : await crearItem(guardarCliente.id)
            }
        } else {
            itemForm.value.destinatario = clienteForm.value.nombre ?? itemForm.value.destinatario
            isItemEditMode.value 
                ? await actualizarItem() 
                : await crearItem()
        }
    }

}

const clienteGuardable = () : boolean => {
    if(clienteForm.value){

    const {
        tipo_documento_id,
        numero_documento,
    } = clienteForm.value

    return (!!tipo_documento_id && numero_documento !== null && numero_documento !== undefined) || 
            (clientesNumerosForm.value.some((numero: any) => numero.numero !== null))
    }

    return false;
}

const crearCliente = async () : Promise<ClienteModel | null> => {
    let response = null
    guardandoCliente.value = true;
    try {
        
        // @ts-ignore
        clienteForm.value.clientes_numeros = clientesNumerosForm.value.filter((n: any) => n.numero !== undefined && n.numero !== null&&  n.numero !== '')
        // @ts-ignore
        response = await clienteRepository.create(clienteForm.value)

    } catch (error) {
        console.log(error)
    } finally {
        guardandoCliente.value = false;
    }
    return response
}

const actualizarCliente = async () => {

    let response = null
    guardandoCliente.value = true;
    try {
        // @ts-ignore
        clienteForm.value.clientes_numeros = clientesNumerosForm.value.filter((n: any) => n.numero !== undefined && n.numero !== '')
        // @ts-ignore
        response = await clienteRepository.update(clienteForm.value, route.params.cliente_id)

    } catch (error) {
        console.log(error)
    } finally {
        guardandoCliente.value = false;
    }
    return response

}

const crearItem = async (cliente_id?: number | null) => {
    if(itemForm.value){
        try {
            guardandoItem.value = true;
            if(cliente_id){
                itemForm.value.cliente_id = cliente_id
            }
            await itemRepository.create(itemForm.value);
            emit('actualizarParada', true)
            router.push({name: 'parada', params: { parada_id: route.params.parada_id}})
            
        } catch (error  : any) {
            const { data } = error;
            let mensaje = data && data.message ?  data.message : 'No se creo correctamente';
            $q.notify({
                type: 'negative',
                message: mensaje,
                position: 'top',
                timeout: 15000
            })
            guardandoItem.value = false;
        }
    } 
}

const actualizarItem = async (cliente_id?: number | null) => {

    if(itemForm.value){
        try {
            guardandoItem.value = true;
            if(cliente_id){
                itemForm.value.cliente_id = cliente_id
            }
            await itemRepository.update(itemForm.value, route.params.item_id as string);
            emit('actualizarParada', true)
            router.push({name: 'parada', params: { parada_id: route.params.parada_id}})
           
        } catch (error) {
            guardandoItem.value = false;
            $q.notify({
                type: 'negative',
                message: 'No se guardo correctamente, revisa todos los campos antes de guardar',
                position: 'top',
                timeout: 3000
            })
        }
    } 

}

</script>