<template>
    <div>
        <q-input 
        class="q-mt-md q-mb-md q-mr-md q-ml-md" 
        @focus="inputFocus" 
        rounded 
        outlined 
        label="Busca aqui"
        v-model="direccion" 
        />

        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const direccion = ref<string>('');

const router = useRouter();

const inputFocus = (event: any) => {
  console.log('push')
  router.push({name: 'buscar-direccion'})
}

</script>