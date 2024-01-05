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
    index: {
      type: Number
    }
  })

  const {
    defaultAddress,
    index
  } = toRefs(props);

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
    place.customName = formattedAddress
    if(isEditMode.value){
      place.index = index.value
    }
    emit('selectedAddress', place)
   
  };
  
  // Función para inicializar el autocompletado
  const autocompleteLocation = () => {
    // @ts-ignore
    const autocomplete = new google.maps.places.Autocomplete(pacInput.value.getNativeElement(), options);
    autocomplete.addListener('place_changed', () => callbackFunction(autocomplete));
  };
  
  onMounted(async () => {
    
    if(!isEditMode.value){
      pacInput.value.getNativeElement().focus()
    }
    autocompleteLocation();
  });

  const isEditMode = computed(() => defaultAddress.value && (index.value || index.value === 0))

  onMounted(() => {
    if(isEditMode.value){
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


</style>