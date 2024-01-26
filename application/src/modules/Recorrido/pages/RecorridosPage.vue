<template>
    <div class="flex column justify-center">
        <q-card
        v-if="cargandoRecorrido"
        v-for="(sk, index) in skeletonRecorridos" 
        class="q-my-sm"
        flat
        >
            <q-card-section class="">
                <q-skeleton type="text" class="text-subtitle1" />
                <q-skeleton type="text" width="50%" class="text-subtitle1" />
                <q-skeleton type="text" class="text-caption" />
                <q-skeleton type="text" class="text-caption" />
            </q-card-section>
        </q-card>

        <div
          v-if="recorridos && recorridos.length > 0"
          v-for="(recorrido, index) in recorridos" 
          :key="index"
          >
            <q-item clickable v-ripple 
            :class="[
              'list-group-item rounded-borders q-my-sm', 
              `bg-white`
            ]"
            @click="router.push({name: 'recorrido', params: { recorrido_id: recorrido.id}})"  
            >
              <q-item-section >
                <div class="flex column justify-center">
                  <div class="flex column text-body1" style="max-width: 85%;">
                    <div  class="text-weight-bold" > Origen </div> 
                    <div  class="" > {{ recorrido.origen_formateado }} </div> 
                  </div>
                  <div class="flex column text-body1" style="max-width: 85%;">
                    <div  class="text-weight-bold" > Destino </div>
                    <div  class="" > {{ recorrido.destino_formateado }} </div> 
                  </div>
                  <div class="flex row items-center">
                    <div class="text-body1 text-weight-bold"> Paradas </div>
                    <div 
                    v-if="recorrido.paradas && recorrido.paradas.length > 0" 
                    class=" q-ml-xs"> 
                        {{ recorrido.paradas.length }} 
                    </div>
                  </div>
                  <div class="flex row items-center">
                    <div class="text-body1 text-weight-bold"> Inicio </div>
                    <div class="q-ml-xs"> {{  recorrido.inicio }}</div>
                  </div>
                  <div class="flex row items-center">
                    <div class="text-body1 text-weight-bold"> Estado </div>
                    <q-chip  
                    :style="`background:${recorrido.recorrido_estado.color};`">
                    {{ recorrido.recorrido_estado.nombre }} 
                    </q-chip>
                  </div>
                  
                </div>
              </q-item-section>
            </q-item>
        </div>

        <div v-if="!cargandoRecorrido" class="flex justify-center q-my-sm">
            <q-pagination
            v-model="pagination.page"
            :max="pagination.last_page"
            max-page="10"
            direction-links
            />
        </div>
    </div>
</template>

<script setup lang="ts">

import { RecorridoModel, RecorridoPaginacionModel } from 'src/models/Recorrido.model';
import RecorridoRepository from 'src/repositories/Recorrido.repository';
import { useUsuarioStore } from 'src/stores/Usuario';
import { computed, watch, onMounted, reactive } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const recorridoRepository = new RecorridoRepository();

const usuarioStore = useUsuarioStore()
const {
    usuario
} = usuarioStore

const recorridos = ref<RecorridoModel[]>([])

const pagination = reactive({
    page: 1,
    total: 5,
    last_page: 1,
    next_page_url: '',
    prev_page_url: ''
})

const currentPage = computed(() => pagination.page)

watch(currentPage, (newVal) => {

    if(pagination.next_page_url || pagination.prev_page_url){
        pagination.page = newVal
        getRecorridos();
    }
})

onMounted(() => getRecorridos());
const cargandoRecorrido = ref<boolean>(false)
const getRecorridos = async () => {
    try {
        recorridos.value = []
        const params = {
            incluir : ['paradas.paradaEstado', 'recorridoEstado'].join(','),
            rider_id : usuario.id,
            page: pagination.page
        }
        cargandoRecorrido.value = true;
        const recorridosServer = await recorridoRepository.get(null, params);
        if('data' in recorridosServer){
            const { data, current_page, total, last_page, next_page_url, prev_page_url } = recorridosServer as RecorridoPaginacionModel
            recorridos.value = data
            pagination.page = current_page
            pagination.total = total
            pagination.last_page = last_page
            pagination.next_page_url = next_page_url
            pagination.prev_page_url = prev_page_url
            console.log(recorridosServer)
        } 
    } catch (error) {
        
    } finally {
        cargandoRecorrido.value = false;
    }
};

const skeletonRecorridos = [1,2,3,4,5];

</script>

<style scoped>

</style>