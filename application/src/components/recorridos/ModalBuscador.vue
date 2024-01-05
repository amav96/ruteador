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
            :defaultAddress="defaultAddress"
            :index="index"
             />
        </q-card-section>
        
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import AutoCompleteGoogleMapInput from 'components/general/AutoCompleteGoogleMapInput.vue';
import { emit } from 'process';

const route = useRoute();

const emit = defineEmits(['selectedAddress'])

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const router = useRouter();

const selectedAddress = (data: any) => {
    emit('selectedAddress', data)
    router.push({name: 'recorridos'})
}

const defaultAddress = ref<string>('')
const index = ref<number | null>(null)
onMounted(() => {
  if(route.params.addressValue && route.params.index){
    defaultAddress.value = route.params.addressValue
    index.value = Number(route.params.index)
  }
})


</script>