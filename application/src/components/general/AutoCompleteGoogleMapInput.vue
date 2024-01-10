<template>
    <div>
      <q-input
        v-model="address"
        placeholder="Busca aqui"
        clearable
        type="text"
        rounded 
        outlined 
        ref="pacInput" 
        id="test"
      >
        <template v-slot:prepend>
          <q-icon @click="$emit('goBack', true)"  name="arrow_back" />
        </template>
      </q-input>
      <!-- <div id="map"></div> -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, toValue } from 'vue';
   // @ts-ignore
import { toRefs, computed } from 'vue';
  import { formatAddress } from '../../utils/google'
  const props = defineProps({
    defaultAddress: {
      type: String,
    },
    id: {
      type: [String, null as any],
      default: '',
    }
  })

  const {
    defaultAddress,
    id
  } = toRefs(props);

  const emit = defineEmits(['goBack', 'selectedAddress'])
  
  // Acceso a la API de Google Maps
  const { google }: any = window;
  
  const address = ref<string>('');
  
  // Ref para el input de búsqueda
  const pacInput = ref<HTMLInputElement | null | any>(null);
  
  // Opciones de configuración para el autocompletado

  
  // Función principal llamada al seleccionar un lugar en el autocompletado
  const callbackFunction = (autocomplete: any) => {
    const place = autocomplete.getPlace();
    const formattedAddress = formatAddress(place.address_components);
    // address.value = formattedAddress;
    place.customName = formattedAddress
    if(isEditMode.value){
      place.id = id.value
    }
    console.log(place)
    emit('selectedAddress', place)
   
  };
  
  // Función para inicializar el autocompletado
  const autocompleteLocation = () => {

    // const map = new google.maps.Map(document.getElementById('map'), {
    //   center: { lat: -34.607831971928825, lng: -58.41476810199054 },
    //   zoom: 13,
    // });

    const options = {
      componentRestrictions: { country: 'ar' },
    };

    // @ts-ignore
    const autocomplete = new google.maps.places.Autocomplete(pacInput.value.getNativeElement() , options);
    autocomplete.setFields(['geometry', 'formatted_address', 'name', 'url', 'icon', 'address_components']);
    autocomplete.addListener('place_changed', () => callbackFunction(autocomplete));
    // autocomplete.bindTo('bounds', map);
  };
  
  onMounted(async () => {
    
    if(!isEditMode.value && pacInput.value){
      pacInput.value.getNativeElement().focus()
    }
    autocompleteLocation();
  });

  const isEditMode = computed(() => defaultAddress?.value && (id.value || id.value === 0))

  onMounted(() => {
    if(isEditMode.value && defaultAddress?.value ){
      address.value = defaultAddress.value 
      setTimeout(() => {
        pacInput.value.getNativeElement().focus()
      }, 300);
    }
  })

  
  </script>

<style>

.pac-container {
  z-index: 9999 !important;
}

.pac-container .pac-item {
    padding: 6px 5px;
    font-size: 17px !important;
  }


  /* #map {
            width: 100%;
            height: 400px;
        } */

</style>