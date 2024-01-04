<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      
    >
      <q-card class="text-black">

        <q-card-section >
            <auto-complete-google-map-input
            @go-back="router.push({name: 'recorridos'})"
            @selected-address="selectedAddress"
             />
        </q-card-section>
        
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'
import AutoCompleteGoogleMapInput from 'components/general/AutoCompleteGoogleMapInput.vue';

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const router = useRouter();

const selectedAddress = (data: any) => {
    console.log(data)
}


</script>