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
      >
        <template v-slot:prepend>
          <q-icon @click="$emit('goBack', true)"  name="arrow_back" />
        </template>
      </q-input>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
   // @ts-ignore
  import { formatAddress } from '@/utils/google'
  const emit = defineEmits(['goBack', 'selectedAddress'])
  
  // Acceso a la API de Google Maps
  const { google }: any = window;
  
  const address = ref('');
  
  // Ref para el input de búsqueda
  const pacInput = ref<HTMLInputElement | null>(null);
  
  // Opciones de configuración para el autocompletado
  const options = {
    componentRestrictions: { country: 'ar' },
    types: ['address'],
    fields: ['address_components', 'geometry', 'icon', 'name'],
    strictBounds: false,
  };
  
  // Función principal llamada al seleccionar un lugar en el autocompletado
  const callbackFunction = (autocomplete: any) => {
    const place = autocomplete.getPlace();
    const formattedAddress = formatAddress(place.address_components);
    // address.value = formattedAddress;
    emit('selectedAddress', place)
    emit('goBack', true)
  };
  
  
  // Función para inicializar el autocompletado
  const autocompleteLocation = () => {
    // @ts-ignore
    const autocomplete = new google.maps.places.Autocomplete(pacInput.value.getNativeElement(), options);
    autocomplete.addListener('place_changed', () => callbackFunction(autocomplete));
  };
  
  onMounted(async () => {
    autocompleteLocation();
  });
  
  </script>

<style>

.pac-container {
  z-index: 9999 !important;
}

.pac-container .pac-item {
    padding: 6px 5px;
    font-size: 17px !important;
  }


</style>