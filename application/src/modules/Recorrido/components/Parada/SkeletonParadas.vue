<template>
    <!-- skeleton de paradas -->
    <q-item 
        v-if="mostrar" 
        v-for="(sk, index) in skeletonRecorrido"
        >
          <q-item-section avatar>
            <q-skeleton size="xs" type="QRadio" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <q-skeleton type="QSlider" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" width="65%" />
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-skeleton size="xs" type="QRadio" />
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

const skeletonRecorrido = [1,2,3,4,5,6]

</script>

<style scoped>

</style>