<template>
    <div>
      <q-input
        v-model="address"
        placeholder="Busca aqui"
        clearable
        type="text"
        rounded 
        outlined 
        class="q-pa-md"
        ref="pacInput"
        color="deep-purple-13"
      >
        <template v-slot:prepend>
          <q-icon @click="$emit('goBack', true)"  name="arrow_back" />
        </template>
      </q-input>
     <div >
      <list-auto-complete-google
      :prediction="predictionList"
      :origin="origin"
      @selected-address="callbackFunction($event)"
      @select-origin="$emit('selectOrigin', $event)"
      @select-destination="$emit('selectDestination', $event)"

      
      />
     </div>
    </div>
  </template>
  
<script setup lang="ts">

const { google }: any = window;

import { ref, onMounted, toRefs, defineProps, defineEmits, computed } from 'vue';
import { formatAddress } from 'src/utils/Google'
import ListAutoCompleteGoogle from 'src/components/Recorrido/ListAutoCompleteGoogle.vue'
import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';

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
});

const { addressValue, id } = toRefs(props);

const emit = defineEmits<{
  (e: 'goBack', data: boolean ): void
  (e: 'selectedAddress', data: GooglePlacesAutocompleteResponseModel): void
  (e: 'selectOrigin', value: GooglePlacesAutocompleteResponseModel | AutoGpsModel): void
  (e: 'selectDestination', value: GooglePlacesAutocompleteResponseModel): void
}>()

const address = ref<string>('');
const pacInput = ref<HTMLInputElement | null | any>(null);

onMounted(() => {
  initService();
});


const predictionList = ref<any[]>([]);
const service = new google.maps.places.AutocompleteService();

const displaySuggestions = function (
  // @ts-ignore
  predictions: google.maps.places.QueryAutocompletePrediction[] | null,
  // @ts-ignore
  status: google.maps.places.PlacesServiceStatus
) {
  if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
    console.log(status)
   
    return;
  }
  predictionList.value = predictions;
};

const initService = (): void => {

  if (!pacInput.value) {
    return; // Salir si pacInput no está disponible
  }

  const service = new google.maps.places.AutocompleteService();

  // Escuchar cambios en el input y realizar solicitudes de autocompletado
  pacInput.value.getNativeElement().addEventListener('input', () => {
    const inputValue = pacInput.value.getNativeElement().value;
   
    if(inputValue){

      const request = {
        input: inputValue,
        componentRestrictions: { country: 'ar' },
      };

      service.getPlacePredictions(request, displaySuggestions);
    } else {
      predictionList.value = []
    }
    
  });
};

const callbackFunction = (autocomplete: any) => {
  const place = autocomplete;
  const formattedAddress = formatAddress(place.address_components);
  place.customName = formattedAddress;

  if (id?.value) {
    place.id = id.value;
  }

  emit('selectedAddress', place);
};


onMounted(async () => {
    if(!isEditMode.value && pacInput.value){
      pacInput.value.getNativeElement().focus()
    }
});

  const isEditMode = computed(() => !!addressValue?.value && !!id?.value);

onMounted(() => {
if (isEditMode.value && addressValue?.value) {
  address.value = addressValue.value;
  setTimeout(() => {
    pacInput.value.getNativeElement().focus();
  }, 300);
}
});

</script>

<style scoped>
.pac-container {
  z-index: 9999 !important;
}

.pac-container .pac-item {
  padding: 6px 5px;
  font-size: 17px !important;
}
</style>../../utils/Google