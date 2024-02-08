<template>
  <div class="relative-position">
    <q-input
      v-model="address"
      placeholder="Busca aqui"
      type="text"
      rounded 
      outlined 
      class="q-pa-md"
      ref="pacInput"
      color="deep-purple-13"
    >
      <template v-if="detectable" v-slot:append>
          <q-icon @click="takePicture" name="photo_camera" />
      </template>
      <template v-slot:prepend>
        <q-icon @click="$emit('goBack', true)"  name="arrow_back" />
      </template>
    </q-input>
   <div class="absolute listado-google" >
    <list-auto-complete-google
    :prediction="predictionList"
    :origin="origin"
    @parada-seleccionada="paradaSeleccionada($event)"
    @origen-seleccionado="$emit('origenSeleccionado', $event)"
    @destino-seleccionado="$emit('destinoSeleccionado', $event)"
    />
   </div>

   <router-view>
   </router-view>
   <dialog-loading :open="detectandoPropiedades" text="Analizando imagen" />
  </div>
</template>

<script setup lang="ts">

const { google }: any = window;

import { ref, onMounted, toRefs, defineEmits, computed, watch } from 'vue';
import { formatearGoogleAddress, geoposicionar } from 'src/utils/Google'
import ListAutoCompleteGoogle from 'src/modules/Recorrido/components/ListAutoCompleteGoogle.vue'
import DialogLoading from 'src/components/General/DialogLoading.vue'
import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useQuasar } from 'quasar';
import RecorridoRepository from 'src/repositories/Recorrido.repository';

import { useRouter } from 'vue-router';
import { useRecorridoStore } from 'src/stores/Recorrido';
import { storeToRefs } from 'pinia';
import { useUsuarioStore } from 'src/stores/Usuario'
import { base64ToFile, compressImage } from 'src/utils/Image'
import { getId } from 'src/utils/Util';

const usuarioStore = useUsuarioStore()

const router = useRouter();

const recorridoStore = useRecorridoStore()
const { propiedadesDetectadas } = storeToRefs(recorridoStore)

const recorridoRepository = new RecorridoRepository();
const $q = useQuasar();

const props = defineProps({
addressValue: {
  type: String
},
id: {
  type: String
},
origin: {
  type: Number
},
destination: {
  type: Number
},
detectable:  {
  type: Boolean,
  default: false
},
abrirListadoAlAutocompletar: {
  type: Boolean,
  default: false
}
});

const { addressValue, id, origin, abrirListadoAlAutocompletar } = toRefs(props);

const emit = defineEmits<{
(e: 'goBack', data: boolean ): void
(e: 'paradaSeleccionada', data: GooglePlacesAutocompleteResponseModel): void
(e: 'origenSeleccionado', value: GooglePlacesAutocompleteResponseModel | AutoGpsModel): void
(e: 'destinoSeleccionado', value: GooglePlacesAutocompleteResponseModel): void
}>()

const address = ref<string>('');
const pacInput = ref<HTMLInputElement | null | any>(null);

const isEditMode = computed(() => !!addressValue?.value && !!id?.value);

onMounted(() => {
initService();
if (addressValue?.value) {
  if(abrirListadoAlAutocompletar.value){
    pacInput.value.getNativeElement().value = addressValue.value
    pacInput.value.getNativeElement().focus()
  }
  address.value = addressValue.value
}

if(!isEditMode.value && pacInput.value && !addressValue?.value){
  pacInput.value.getNativeElement().focus()
}
});

const predictionList = ref<any[]>([]);

const displaySuggestions = function (
// @ts-ignore
predictions: google.maps.places.QueryAutocompletePrediction[] | null,
// @ts-ignore
status: google.maps.places.PlacesServiceStatus
) {
if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
  return;
}
predictionList.value = predictions;
};

const service = ref<any>(null)
const initService = (): void => {

if (!pacInput.value) {

  return; // Salir si pacInput no está disponible
}

service.value = new google.maps.places.AutocompleteService();
};

watch(address, (newVal: string, oldValue) => {

  if(newVal !== oldValue){
  const inputValue = pacInput.value.getNativeElement().value;
    const { usuario } = usuarioStore;

  if(inputValue){
    const request : any = {
      input: newVal,
    };
    if(usuario.pais?.iso){
      request.componentRestrictions = {
        country: usuario.pais?.iso.toLowerCase()
      }
    }

    service.value.getPlacePredictions(request, displaySuggestions);
  } else {
    predictionList.value = []
  }
  }
  
})

const paradaSeleccionada = (autocomplete: any) => {
const place = autocomplete;
const formattedAddress = formatearGoogleAddress(place.address_components);
place.customName = formattedAddress;

if (id?.value) {
  place.id = id.value;
}
predictionList.value = []
emit('paradaSeleccionada', place);
};

const detectandoPropiedades = ref<boolean>(false)
const takePicture = async () => {
const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Base64,
  source: CameraSource.Prompt
});

if(image.base64String){

 try {
  detectandoPropiedades.value = true

  const { base64String, format } = image

  const filename = getId() + "." + format; // Combi
  const mimeType = "image/" + format; // Tipo MIME
  
  const file = await compressImage(await base64ToFile(base64String, filename, mimeType));
  console.log(file)
  let formData = new FormData();
  formData.append('file', file, filename);

  const response = await recorridoRepository.detectarPropiedades(formData);
  const { propiedades } = response

  if(propiedades){
     const { direccion } = propiedades
     if(direccion){

      const geo = await geoposicionar('','', direccion)
      geo.results = geo.results.filter((g: any) => g.types.includes('street_address'))
      const [ item ] = geo.results
      propiedadesDetectadas.value = propiedades
      router.push({name: 'detectar-propiedades'})
      
     } else {
      $q.notify({
          type: 'warning',
          message: 'Direccion no detectada',
      });
     }
  }

 } catch (error) {
  console.log(error)
  
 } finally {
  detectandoPropiedades.value = false
 
 }
}

};


</script>

<style scoped>
.pac-container {
z-index: 9999 !important;
}

.pac-container .pac-item {
padding: 6px 5px;
font-size: 17px !important;
}

.listado-google{
z-index: 500;
width: 100%;
background: white;
}

</style>