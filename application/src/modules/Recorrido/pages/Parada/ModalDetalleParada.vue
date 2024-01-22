<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black flex column justify-between q-pa-sm " style="height:100vh;">
        <div>
            <div class="q-mb-md full-width">
                <q-icon 
                @click="router.push({name: 'recorrido', params: { recorrido_id: route.params.recorrido_id}})" 
                name="arrow_back" 
                color="deep-purple-13"
                size="sm"
                />
        
            </div>
            
            <div class="flex justify-center items-center">
                    <span class="text-subtitle1 text-weight-medium">
                    {{ parada?.direccion_formateada }}
                    </span>
                    <span v-if="parada?.localidad" class="q-mx-sm" >-</span>
                    <span v-if="parada?.localidad" class="text-subtitle1 text-weight-medium">
                    {{ parada?.localidad }}
                    </span>
            </div>
            

            <google-iframe-map
            v-if="parada"
            :lat="parada.lat"
            :lng="parada.lng"
            
            />

            <div class="flex justify-end">
                <q-btn 
                class="q-my-sm q-py-sm" 
                label="Navegar" 
                color="black" 
                rounded
                unelevated 
                icon="near_me"
                />
            </div>

            <q-separator spaced />

            <div v-if="!trayendoParada && !tieneItems" class="flex column">
                <div class="flex row items-center q-gutter-x-sm">
                    <div>
                        <span class="text-weight-bold text-h6">Paquete</span>
                    </div> 
                    <div @click="goToAgregarPaquete">
                        <q-btn round size="xs" color="deep-purple-13" icon="add" />
                    </div>
                </div>
            </div>

            <template v-if="tieneItems">
                <!-- <div class="q-mb-lg q"> 
                    <span class="text-weight-bold text-h6">
                        {{ items.length > 1 ? 'Paquetes' : '' }}
                    </span>
                </div> -->
                <div class="flex column items-center full-width">
                    <div
                    v-for="(item, index) in items"
                    :key="index"
                    class="full-width"
                    >
                    <div class="flex row no-wrap full-width">
                        <div class="flex column justify-between" style="width:90%;">
                            <div>
                                <span class="text-weight-regular text-h6">
                                    {{ item.cliente?.nombre ?? item.destinatario }}
                                </span>
                            </div>
                            <div>
                                Numero envio: {{ item.track_id }}
                            </div>
                            <div>
                                {{ item.item_estado.nombre }}
                            </div>
                            <div>
                                Proveedor: {{ item.item_proveedor.nombre }}
                            </div>
                            <div>
                                Agencia: {{ item.empresa.nombre }}
                            </div>
                            <div>
                                Tipo: {{ item.item_tipo.nombre }}
                            </div>
                            <div v-if="item.cliente">
                                {{ item.cliente.tipo_documento.nombre }} {{ item.cliente.numero_documento }}
                            </div>
      
                        </div>
                        <div class="flex justify-end" style="width:10%;">
                            <q-icon @click="goToEditarItemCliente" name="edit" size="sm" />
                        </div>
                        <!-- TODO: mostrar numero tlf, documento -->
                        <!-- <div class="flex column">
                            <q-btn 
                            class="q-my-sm q-py-sm" 
                            label="Entregar" 
                            color="deep-purple-13" 
                            unelevated 
                            />
                            <q-btn 
                            class="q-my-xs text-deep-purple-13 q-py-sm" 
                            label="No pude hacer la entrega" 
                            unelevated 
                            />
                        </div> -->
                        
                        
                    </div>
                    <q-separator v-if="items.length > 1" spaced  />
                    
                    </div>
                </div>
            </template>
        </div>
        <div class="flex column">
            <q-btn 
            class="q-my-sm q-py-sm" 
            label="Entregar" 
            color="deep-purple-13" 
            unelevated 
            />
            <q-btn 
            class="q-my-xs text-deep-purple-13 q-py-sm" 
            label="No pude hacer la entrega" 
            unelevated 
            />
        </div> 
      </q-card>
      <router-view
      @actualizar-parada="getParada"
      >

      </router-view>
    </q-dialog>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import ParadaRepository from 'src/repositories/Parada.repository'
import { ParadaModel } from 'src/models/Parada.model';
import { ItemModel } from 'src/models/Item.model';
import GoogleIframeMap from 'src/components/General/GoogleIframeMap.vue';

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
    router.push({name: 'agregar-item',})
}

const goToEditarItemCliente = () => {
    const [item] = items.value
    const { cliente_id, id: item_id } = item;
    router.push({name: 'editar-item-cliente', params: { item_id, cliente_id }})
}

const parada = ref<ParadaModel | null>(null)
const items = ref<ItemModel[]>([])
const tieneItems = computed(() => items.value.length > 0)
const trayendoParada = ref<boolean>(false);

const getParada = async () => {

    trayendoParada.value = true;

    try {
        let params = {
            incluye: [
                'items.itemEstado', 
                'items.cliente',
                'items.cliente.tipoDocumento', 
                'items.itemProveedor', 
                'items.itemTipo', 
                'items.empresa'
            ].join(',')
        }
        
        const response  = await paradaRepository.getParada(params, parada_id as string)
        const [paradaServer] = response
        if(paradaServer){
            parada.value = paradaServer
        }
        if(paradaServer.items && paradaServer.items.length > 0){
            items.value = paradaServer.items
        } else {

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