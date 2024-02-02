<template>
    <q-item 
        v-if="mostrar" 
        v-for="(sk, index) in skeleton"
        class="full-width"
        >
          <q-item-section>
            <q-item-label>
              <q-skeleton type="QSlider" />
            </q-item-label>
          </q-item-section>
        </q-item>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';


const props = defineProps({
    mostrar: {
      type: Boolean,
    },

})

const {
    mostrar
} = toRefs(props);

const skeleton = [1,2,3,4,5]

</script>

<style scoped>

</style>