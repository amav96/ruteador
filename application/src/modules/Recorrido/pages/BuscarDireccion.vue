<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black">
          <auto-complete-google-map-input-service
          :addressValue="(addressValue as string)"
          :id="id as string ?? ''"
          :origin="Number(origin) ?? 0"
          :destination="Number(destination) ?? 0"
          @go-back="router.push({name: 'recorrido'})"
          @selected-address="selectedAddress"
          @select-origin="selectOrigin"
          @select-destination="selectDestination"
          />
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import AutoCompleteGoogleMapInputService from 'components/General/AutoCompleteGoogleMapInputService.vue';
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
  (e: 'selectedAddress', data: GooglePlacesAutocompleteResponseModel): void
  (e: 'selectOrigin', value: GooglePlacesAutocompleteResponseModel | AutoGpsModel): void
  (e: 'selectDestination', value: GooglePlacesAutocompleteResponseModel): void
}>()

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const router = useRouter();

const selectedAddress = (data: any) => {
  
  if(origin){
    selectOrigin(data)
  } else if(destination){
    selectDestination(data)
  } else {
    emit('selectedAddress', data)
    router.push({name: 'recorrido'})
  }
  
 
}

const selectOrigin = (value: GooglePlacesAutocompleteResponseModel | AutoGpsModel) => {
  emit('selectOrigin', value)
  router.push({name: 'recorrido'})
}

const selectDestination = (value: GooglePlacesAutocompleteResponseModel) => {
  emit('selectDestination', value)
  router.push({name: 'recorrido'})
}


</script>