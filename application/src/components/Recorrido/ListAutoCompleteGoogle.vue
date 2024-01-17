<template>
  <div >

    <q-list bordered separator>
      <q-item 
      clickable 
      v-ripple
      v-if="origin"
      @click="selectAutoOrigin"
      >
        <q-item-section avatar>
          <q-icon color="deep-purple-13" name="location_on" />
        </q-item-section>
        <q-item-section class="text-body1">
           Mi ubicación
        </q-item-section>
        <q-item-section
        
        avatar>
          <q-icon color="deep-purple-13" name="gps_fixed" />
        </q-item-section>
      </q-item>

      <q-item 
      clickable 
      v-ripple
      v-if="prediction && prediction.length > 0" 
      v-for="(item, index) in prediction"
      @click="selected(item)"
      >
        <q-item-section avatar>
          <q-icon color="deep-purple-13" name="location_on" />
        </q-item-section>
        <q-item-section class="text-body1">
          {{ item.description }}
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
import { toRefs, watch } from 'vue';

const emit = defineEmits<{
  (e: 'selectedAddress', data: GooglePlacesAutocompleteResponseModel): void
  (e: 'selectOrigin', value: GooglePlacesAutocompleteResponseModel | AutoGpsModel): void
  (e: 'selectDestination', value: GooglePlacesAutocompleteResponseModel): void
}>()

// @ts-ignore
const geocoder = new google.maps.Geocoder();

const props = defineProps({
  prediction: { type: Array<any>, default : () => []},
  origin: { type: Number, default: 0 },
  destination: { type: Number, default: 0 },
});

const { prediction, origin, destination } = toRefs(props);

const selected = (item: GooglePlacesAutocompleteResponseModel) => {
  const {
    place_id
  } = item
  geocoder
  .geocode({ placeId: place_id })
    .then(({ results } : any) => {
      if(results[0]){
        if(destination.value){
          emit('selectDestination', results[0])
        } else {
          emit('selectedAddress', results[0])
        }
      
      }
    })
    .catch((e: any) => window.alert("Geocoder failed due to: " + e));
}

const selectAutoOrigin = () => {
  emit('selectOrigin', { auto: true})
}


</script>