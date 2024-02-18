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
        :addressValue="(addressValue as string)"
        :id="id as string ?? ''"
        :origin="Number(origin) ?? 0"
        :destination="Number(destination) ?? 0"
        :detectable="!addressValue && !origin && !destination" 
        @go-back="router.push({name: 'recorrido'})"
        @parada-seleccionada="direccion.data = $event"
        @origen-seleccionado="origenSeleccionado"
        @destino-seleccionado="destinoSeleccionado"
        />
        <template v-if="creandoParada">
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
              @formulario-cargado="cargandoFomularios = $event"
              /> 
          </div>
        </template>
      </div>
      <div v-if="creandoParada" :class="[breakpoint.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-lg q-pa-sm ']" >
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
import { ref, computed, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import FormItem from 'src/modules/Recorrido/components/Parada/Item/FormItem.vue'
import ClienteForm from 'src/modules/Recorrido/components/Parada/Cliente/ClienteForm.vue'
import AutoCompleteGoogleInput from 'src/modules/Recorrido/components/Parada/AutoCompleteGoogleInput.vue';
import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
import { useQuasar } from 'quasar';
import { useUsuarioStore } from 'src/stores/Usuario'
import { direccionLegible, formatearGoogleAddress } from 'src/utils/Google';
import { reactive } from 'vue';
import ParadaRepository from 'src/repositories/Parada.repository';
import guardarParadaComposable from 'src/modules/Recorrido/composables/GuardarParadaComposable'

const {
  agregarParadaDetectada,
  clienteGuardable,
  crearCliente,
  crearItem,
  creandoParada,
  mostrarInformacionContacto,
  mostrarInformacionPaquete,
  formItemRef,
  formContactoRef,
  itemForm,
  clienteForm,
  clientesNumerosForm,
  guardandoCliente,
  guardandoItem,
  cargandoFomularios,
 } = guardarParadaComposable()

const paradaRepository = new ParadaRepository();

const route = useRoute();
const $q = useQuasar()
let timer : any
const breakpoint = computed(() => $q.screen)
// query params

const {
  addressValue = '',
  id = '',
  origin = 0,
  destination = 0,
} = route.query


const emit = defineEmits<{
  (e: 'origenSeleccionado', value: GooglePlacesAutocompleteResponseModel | AutoGpsModel): void
  (e: 'destinoSeleccionado', value: GooglePlacesAutocompleteResponseModel): void
}>()

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const router = useRouter();

const origenSeleccionado = (value: GooglePlacesAutocompleteResponseModel | AutoGpsModel) => {
  emit('origenSeleccionado', value)
  router.push({name: 'recorrido'})
}

const destinoSeleccionado = (value: GooglePlacesAutocompleteResponseModel) => {
  emit('destinoSeleccionado', value)
  router.push({name: 'recorrido'})
}

const usuarioStore = useUsuarioStore()

const direccion = reactive<any>({
    data: {},
    formatted_address : ''
})
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


        const response = await paradaRepository.create({
            recorrido_id: Number(recorridoId.value),
            lat: (typeof lat === 'function' ? lat() : lat),
            lng: (typeof lng === 'function' ? lng() : lng),
            direccion_formateada: direccionLegible(resultadoFormateo, formatted_address),
            rider_id: usuario.id,
            codigo_postal: codigo_postal ?? '',
            localidad: localidad ?? '',
            provincia: provincia ?? '',
            // TODO:
            // tipo_domicilio
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

onBeforeUnmount(() => {
    if (timer !== void 0) {
    clearTimeout(timer)
    $q.loading.hide()
    }
})

</script>