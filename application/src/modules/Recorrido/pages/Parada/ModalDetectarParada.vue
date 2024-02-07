<template>
     <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black flex justify-between column no-wrap items-center" >

        <div style="flex: 1;overflow: auto;" class="text-black flex column no-wrap full-width">
            <auto-complete-google-input
            v-if="direccion.formatted_address"
            :addressValue="(direccion.formatted_address as string)"
            :detectable="false"
            :abrir-listado-al-autocompletar="abrirListadoAlAutocompletar"
            @go-back="router.push({name: 'buscar-direccion'})"
            @parada-seleccionada="paradaSeleccionada"
            />

            <div    
            :class="['flex row justify-between text-weight-bold text-h6 q-mb-xs q-mt-sm q-pa-sm  cursor-pointer', breakpoint.xs ? 'full-width' : '']">
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

            <div :class="['full-width  flex column q-pa-sm' , breakpoint.xs ? 'justify-center items-center' : 'justify-start items-start']" v-show="mostrarInformacionPaquete">
                <form-item 
                ref="formItemRef"
                :item_id="route.params.item_id as string ?? null"
                :item="itemAutoCompletable"
                @formulario-cargado="cargandoFomularios = $event"
                /> 
            </div>
            
            <div 
            :class="['flex row justify-between text-weight-bold text-h6 q-my-lg cursor-pointer q-pa-sm ', breakpoint.xs ? 'full-width' : '']">
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
    
            <div :class="['full-width  flex column q-pa-sm' , breakpoint.xs ? 'justify-center items-center' : 'justify-start items-start']" v-show="mostrarInformacionContacto">
                <cliente-form 
                ref="formContactoRef"
                :cliente_id="route.params.cliente_id as string ?? null"
                :cliente="clienteAutoCompletable"
                @formulario-cargado="cargandoFomularios = $event"
                /> 
            </div>
        </div>
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-lg q-pa-sm ']" >
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
import AutoCompleteGoogleInput from 'src/modules/Recorrido/components/Parada/AutoCompleteGoogleInput.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute, routerKey } from 'vue-router'
import { useQuasar } from 'quasar'
import { ItemModel, ItemRequestModel } from 'src/models/Item.model';
import { ParadaModel } from 'src/models/Parada.model';
import { ClienteRequestModel, ClienteModel } from 'src/models/Cliente.model';
import ItemRepository from 'src/repositories/Item.repository'
import ClienteRepository from 'src/repositories/Cliente.repository'
import { useRecorridoStore } from 'src/stores/Recorrido';
import { storeToRefs } from 'pinia';
import { reactive } from 'vue';
import { direccionLegible, formatearGoogleAddress, geoposicionar } from 'src/utils/Google';
import { GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
import { useUsuarioStore } from 'src/stores/Usuario'
import ParadaRepository from 'src/repositories/Parada.repository';

const paradaRepository = new ParadaRepository();

const emit = defineEmits<{
  (e: 'actualizarParada', data: boolean): void
}>()

const recorridoStore = useRecorridoStore()
const { propiedadesDetectadas, recorrido, paradas } = storeToRefs(recorridoStore)

const itemAutoCompletable = reactive<ItemModel | any>({})
const clienteAutoCompletable = reactive<ClienteModel | any>({})
const direccion = reactive<any>({
    data: {},
    formatted_address : ''
})

const abrirListadoAlAutocompletar = ref<boolean>(false)
onMounted(async () => {
    if(!propiedadesDetectadas.value){
        router.push({name: 'buscar-direccion'})
        return
    }

    const {
    codigo_area_id,
    nombre,
    item_estado_id,
    item_proveedor_id,
    item_tipo_id,
    numero_documento,
    numero_telefono,
    observaciones,
    tipo_documento_id,
    track_id,
    direccion: direccionDetectada,
    } = propiedadesDetectadas.value

    if(item_estado_id) itemAutoCompletable.item_estado_id = item_estado_id
    if(item_proveedor_id) itemAutoCompletable.item_proveedor_id = item_proveedor_id
    if(item_tipo_id) itemAutoCompletable.item_tipo_id = item_tipo_id
    if(track_id) itemAutoCompletable.track_id = track_id   

   
    if(nombre) clienteAutoCompletable.nombre = nombre
    if(numero_documento) clienteAutoCompletable.numero_documento = numero_documento
    if(observaciones) clienteAutoCompletable.observaciones = observaciones
    if(tipo_documento_id) clienteAutoCompletable.tipo_documento_id = tipo_documento_id

    if(codigo_area_id && numero_telefono){
        clienteAutoCompletable.clientes_numeros = [{ codigo_area_id, numero: numero_telefono }]
    }

    if(direccionDetectada){
        const geo = await geoposicionar('','',direccionDetectada)
       
        if(geo.results.length === 0){
            abrirListadoAlAutocompletar.value = true
            direccion.formatted_address = direccionDetectada

        } else {
            let tipoDireccion = geo.results.filter((g: any) => g.types.includes('street_address'))
            geo.results = tipoDireccion.length > 0 ? tipoDireccion : geo.results
            const resultadoFormateo = formatearGoogleAddress(geo.results[0].address_components) 
            direccion.data = geo.results[0]
            direccion.formatted_address = resultadoFormateo.formatted_address
        }
        
    }

})

const itemRepository = new ItemRepository()
const clienteRepository = new ClienteRepository();

const usuarioStore = useUsuarioStore()

const $q = useQuasar()
let timer : any
const breakpoint = computed(() => $q.screen)

const route = useRoute();
const router = useRouter();

const mostrarInformacionContacto = ref<boolean>(true)
const mostrarInformacionPaquete = ref<boolean>(true)

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const formItemRef = ref<any>(null)
const formContactoRef = ref<any>(null)

const itemForm = ref<ItemRequestModel | null>(null)
const clienteForm = ref<ClienteRequestModel | null>(null)
const clientesNumerosForm = ref<any>(null)

const guardandoCliente = ref<boolean>(false)
const guardandoItem = ref<boolean>(false)

const cargandoFomularios = ref<boolean>(false)
const recorridoId = computed(() => route.params.recorrido_id)
const manejarData = async () => {
   if(Object.keys(direccion.data).length === 0){
        $q.notify({
            type: 'info',
            message: 'Debes elegir una direccion del listado',
            timeout: 5000
        });
        return
   }

    const { usuario } = usuarioStore;
    if(!usuario) return

    try {
        $q.loading.show()
        const { geometry: { location : { lat , lng} } , formatted_address } = direccion.data;
        const resultadoFormateo = formatearGoogleAddress(direccion.data.address_components) 
        const {
            localidad,
            provincia,
            codigo_postal,
        } = resultadoFormateo

        const {
            tipo_domicilio
        } = propiedadesDetectadas.value

        const response = await paradaRepository.create({
            recorrido_id: Number(recorridoId.value),
            lat: (typeof lat === 'function' ? lat() : lat),
            lng: (typeof lng === 'function' ? lng() : lng),
            direccion_formateada: direccionLegible(resultadoFormateo, formatted_address),
            rider_id: usuario.id,
            codigo_postal: codigo_postal ?? '',
            localidad: localidad ?? '',
            provincia: provincia ?? '',
            tipo_domicilio
        });
        const { parada } = response;
        agregarParadaDetectada(parada)
        
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
            itemForm.value.parada_id = parada.id

            clienteForm.value.empresa_id = itemForm.value.empresa_id

            itemForm.value.destinatario = clienteForm.value.nombre ?? itemForm.value.destinatario
            clienteForm.value.nombre = itemForm.value.destinatario ?? clienteForm.value.nombre
            
            if(clienteGuardable()){
                const guardarCliente = await crearCliente()
                if(guardarCliente){
                    await crearItem(guardarCliente.id)
                }
            } else {
                itemForm.value.destinatario = clienteForm.value.nombre ?? itemForm.value.destinatario
                await crearItem()
            }

           
        }
    } catch (error) {
       
        $q.notify({
            type: 'warning',
            message: 'No se creo correctamente la parada',
        });
    } finally{ 
        $q.loading.hide()
        timer = void 0
        router.push({name: 'recorrido',  params: { recorrido_id: recorridoId.value}})
    }

}

const clienteGuardable = () : boolean => {
    if(clienteForm.value){

    const {
        tipo_documento_id,
        numero_documento,
        nombre
    } = clienteForm.value

    return (!!tipo_documento_id && numero_documento !== null && numero_documento !== undefined) || 
            (clientesNumerosForm.value.some((numero: any) => numero.numero !== null) || nombre)
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

const crearItem = async (cliente_id?: number | null) => {
    if(itemForm.value){
        try {
            guardandoItem.value = true;
            if(cliente_id){
                itemForm.value.cliente_id = cliente_id
            }
            const response = await itemRepository.create(itemForm.value);
            
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

const paradaSeleccionada = (data: GooglePlacesAutocompleteResponseModel) => {
    direccion.data = data
}

const agregarParadaDetectada = (data: ParadaModel) => {
 
    paradas.value.unshift(data)
    if(recorrido.value){
      recorrido.value.optimizado = 0;
    }
}

onBeforeUnmount(() => {
    if (timer !== void 0) {
    clearTimeout(timer)
    $q.loading.hide()
    }
})

</script>