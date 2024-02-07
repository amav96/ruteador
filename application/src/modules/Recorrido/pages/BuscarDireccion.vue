<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black">
          <auto-complete-google-input
          :addressValue="(addressValue as string)"
          :id="id as string ?? ''"
          :origin="Number(origin) ?? 0"
          :destination="Number(destination) ?? 0"
          :detectable="!addressValue && !origin && !destination" 
          @go-back="router.push({name: 'recorrido'})"
          @parada-seleccionada="paradaSeleccionada"
          @origen-seleccionado="origenSeleccionado"
          @destino-seleccionado="destinoSeleccionado"
          />
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import AutoCompleteGoogleInput from 'src/modules/Recorrido/components/Parada/AutoCompleteGoogleInput.vue';
import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';

const route = useRoute();
// query params

const {
  addressValue = '',
  id = '',
  origin = 0,
  destination = 0,
} = route.query


const emit = defineEmits<{
  (e: 'paradaSeleccionada', data: GooglePlacesAutocompleteResponseModel): void
  (e: 'origenSeleccionado', value: GooglePlacesAutocompleteResponseModel | AutoGpsModel): void
  (e: 'destinoSeleccionado', value: GooglePlacesAutocompleteResponseModel): void
}>()

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const router = useRouter();

const paradaSeleccionada = (data: any) => {
  if(origin){
    origenSeleccionado(data)
  } else if(destination){
    destinoSeleccionado(data)
  } else {
   
    emit('paradaSeleccionada', data)
    router.push({name: 'recorrido'})
  }
  
}

const origenSeleccionado = (value: GooglePlacesAutocompleteResponseModel | AutoGpsModel) => {
  emit('origenSeleccionado', value)
  router.push({name: 'recorrido'})
}

const destinoSeleccionado = (value: GooglePlacesAutocompleteResponseModel) => {
  emit('destinoSeleccionado', value)
  router.push({name: 'recorrido'})
}


</script>