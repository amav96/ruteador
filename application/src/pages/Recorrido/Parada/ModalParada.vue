<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black flex column q-pa-sm " style="height:100vh;">

        <div class="q-mb-lg full-width">
            <q-icon 
            @click="router.push({name: 'recorrido', params: { recorrido_id: route.params.recorrido_id}})" 
            name="arrow_back" 
            color="deep-purple-13"
            size="sm"
            />
    
        </div>
        
        <div v-if="!trayendoParada && !tieneItems" class="flex column">
            <div class="flex row items-center q-gutter-x-sm">
                <div>
                    <span class="text-weight-bold text-h6">Paquete</span>
                </div> 
                <div @click="goToAgregarPaquete">
                    <q-btn round size="sm" color="deep-purple-13" icon="add" />
                </div>
            </div>
        </div>

        <template v-if="tieneItems">
            <!-- <div class="q-mb-lg q"> 
                <span class="text-weight-bold text-h6">
                    {{ items.length > 1 ? 'Paquetes' : '' }}
                </span>
            </div> -->
            <div class="flex column">
                <q-list
                v-for="(item, index) in items"
                :key="index"
                >
                <q-item>
                    <q-item-section>
                    <q-item-label>Single line item</q-item-label>
                    <q-item-label caption>Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.</q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                    <q-badge color="teal" label="10k" />
                    </q-item-section>
                </q-item>
                <q-separator spaced  />
                </q-list>
            </div>
        </template>

        <!-- <div class="full-width flex column items-center q-gutter-y-sm">
            <div>
                <q-btn
                unelevated 
                rounded 
                color="deep-purple-13"
                label="Entregar" 
                class="cursor-pointer"
                style="width:250px;"
                />
            </div>
            <div>
                <q-btn
                unelevated 
                rounded 
                
                label="No pude hacer la entrega" 
                class="cursor-pointer text-deep-purple-13"
                style="width:250px;"
                />
            </div>
        </div> -->
      </q-card>
      <router-view ></router-view>
    </q-dialog>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import ParadaRepository from 'src/repositories/Parada.repository'
import { ParadaModel } from 'src/models/Parada.model';
import { ItemModel } from 'src/models/Item.model';

const paradaRepository = new ParadaRepository();

const route = useRoute();
// query params

const {
  parada_id
} = route.params

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const router = useRouter();

const goToAgregarPaquete = () => {
    router.push({name: 'agregar-item'})
}

const parada = ref<ParadaModel | null>(null)
const items = ref<ItemModel[]>([])
const tieneItems = computed(() => items.value.length > 0)
const trayendoParada = ref<boolean>(false);
const getParada = async () => {

    trayendoParada.value = true;

    try {
        let params = {
            incluye: ['items.estadoItem', 'items.cliente', 'items.proveedorItem', 'items.tipoItem'].join(',')
        }
        
        const response  = await paradaRepository.getParada(params, parada_id as string)
        const [paradaServer] = response
        if(paradaServer.items && paradaServer.items.length > 0){
            items.value = paradaServer.items
        }

    } catch (error) {
        
    } finally{
        trayendoParada.value = false;
    }
    
}

onMounted(() => {
    getParada()
})


</script>