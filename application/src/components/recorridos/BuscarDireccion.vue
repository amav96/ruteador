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
          @go-back="router.push({name: 'recorridos'})"
          @selected-address="selectedAddress"
          @select-origin="selectOrigin"
          @select-destination="selectDestination"
          />
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import AutoCompleteGoogleMapInputService from 'components/general/AutoCompleteGoogleMapInputService.vue';

const route = useRoute();
// query params

const {
  addressValue = '',
  id = '',
  origin = 0,
  destination = 0,
} = route.query


const emit = defineEmits(['selectedAddress','selectOrigin', 'selectDestination'])

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
    router.push({name: 'recorridos'})
  }
  
 
}

const selectOrigin = (value: object) => {
  emit('selectOrigin', value)
  router.push({name: 'recorridos'})
}

const selectDestination = (value: object) => {
  emit('selectDestination', value)
  router.push({name: 'recorridos'})
}


</script>