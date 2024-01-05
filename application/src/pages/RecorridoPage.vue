<template>
    <div>
        <q-input 
        class="q-mt-md q-mb-lg q-mr-md q-ml-md" 
        @focus="inputFocus" 
        rounded 
        outlined 
        label="Busca aqui"
        v-model="direccion" 
        />

        <template
        v-if="recorrido && recorrido.length > 0"
        v-for="(parada, index) in recorrido"
        :key="index"
        >
            <q-item 
            clickable 
            v-ripple
            >
                <q-item-section @click="openUpdateAddress(parada, index)"> {{ parada.customName }}</q-item-section>
                <q-item-section avatar>
                    <q-icon size="xs" @click="removeAddres(index)" name="close"  />
                </q-item-section>
                
            </q-item>
            <q-separator />
        </template>
            
        <router-view
        @selected-address="handleAddress"
        >
        </router-view>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore
import RecorridoRepository from 'src/repositories/RecorridoRepository'
import { onMounted } from 'vue';

const recorridoRepository = new RecorridoRepository()


const direccion = ref<string>('');

const router = useRouter();

const inputFocus = (event: any) => {
  router.push({name: 'buscar-direccion'})
}

const recorrido = ref<any[]>([]);

const handleAddress = (data: any) => {
    if(!data.hasOwnProperty('index')){
        addAddress(data)
    } else {
        updateAddress(data)
    }
}

const addAddress = (data: any) => {
    recorrido.value.push({
        customName: data.customName,
        name: data.name,
        location: {
            lat : data.geometry.location.lat(),
            lng: data.geometry.location.lng()
        }
    })

    recorridoRepository.set(recorrido.value);
}

const updateAddress = (data: any) => {

    recorrido.value = recorrido.value.map((rec, index) => {
        if(index === data.index){
            rec = data
            return rec
        }
        return rec
    })
}

const openUpdateAddress = (data: any, index: number) => {
    router.push({name: 'buscar-direccion', params: {addressValue: data.customName, index }})
}

const removeAddres = (index: number) => {
    recorrido.value.splice(index, 1)
    recorridoRepository.set(recorrido.value);
}

onMounted(() => {
    const recorridoActual = recorridoRepository.findAll()
    if(recorridoActual){
        recorrido.value = recorridoActual
    }
})

</script>