<template>
    <q-dialog v-model="mostrar" persistent transition-show="scale" transition-hide="scale">
      <q-card class="bg-teal text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">Actualización</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Debes actualizar la aplicacion para seguir usandola. Click en actualizar para redirigir al play store
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="Esconder" v-close-popup />
          <q-btn flat label="Actualizar" @click="actualizar"  />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { toRefs, ref } from 'vue';

const props = defineProps({
    url: {
      type: String,
    },
})

const { url } = toRefs(props);

const mostrar = ref<boolean>(true)

const actualizar = () => {
  if(url){
    window.open(url.value)
  }
}

</script>

<style scoped>

</style>