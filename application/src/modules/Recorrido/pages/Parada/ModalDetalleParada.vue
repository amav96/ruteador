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
            
            <div class="flex column justify-center  items-center">
                    <div class="text-subtitle1 text-weight-medium text-center q-mx-sm">
                    {{ parada?.direccion_formateada }}
                    </div>
                    
                    <div v-if="parada?.localidad" class="text-subtitle1 text-weight-medium">
                    {{ parada?.localidad }}
                    </div>
            </div>
            

            <google-iframe-map
            v-if="parada"
            :lat="parada.lat"
            :lng="parada.lng"
            
            />

            <div v-if="parada" class="flex justify-end">
                <q-btn 
                @click="navegar(parada.lat, parada.lng)"
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
                            <div class="q-mb-xs">
                                Numero envio: <span class="text-weight-medium" >{{ item.track_id }}</span>
                            </div>
                            <div class="q-mb-xs">
                                <span class="text-weight-medium" >{{ item.item_proveedor.nombre }}</span>
                            </div>
                            <div class="q-mb-xs">
                                Agencia: <span class="text-weight-medium" >{{ item.empresa.nombre }}</span>
                            </div>
                            <div class="q-mb-xs">
                                Tipo: <span class="text-weight-medium" >{{ item.item_tipo.nombre }}</span>
                            </div>
                            <div class="q-mb-xs" v-if="item.cliente && item.cliente.numero_documento">
                                <span class="text-weight-medium" >{{ item.cliente.tipo_documento?.nombre }} {{ item.cliente.numero_documento }}</span>
                            </div>
                            <div class="flex text-white q-mb-xs" >
                                <q-chip :style="`background:${item.item_estado.color};`" text-color="white" >
                                    {{ item.item_estado.nombre }} 
                                </q-chip>
                            </div>
      
                        </div>
                        <div v-if="paqueteEntregable" class="flex justify-end" style="width:10%;">
                            <q-icon @click="goToEditarItemCliente" name="edit" size="sm" />
                        </div>
                        <!-- TODO: mostrar numero tlf, documento -->
                       
                    </div>
                    <q-separator v-if="items.length > 1" spaced  />
                    
                    </div>
                </div>
            </template>
        </div>

        <!-- acciones  -->
        <div v-if="paqueteEntregable" class="flex column">
            <q-btn 
            class="q-my-sm q-py-sm" 
            label="Entregar" 
            color="deep-purple-13" 
            unelevated 
            @click="abrirConfirmar = !abrirConfirmar"
            />
            <q-btn 
            class="q-my-xs text-deep-purple-13 q-py-sm" 
            label="No pude hacer la entrega" 
            unelevated 
            />
        </div> 
        <div v-else class="flex column" >
            <q-btn 
            class="q-my-sm q-py-sm" 
            label="Atras" 
            color="deep-purple-13" 
            unelevated 
            @click="router.push({name: 'recorrido', params: { recorrido_id: recorrido_id}})"
            />
        </div> 

        <!-- confirmar entrega -->
        <q-dialog v-model="abrirConfirmar" persistent>
            <q-card>
                <q-card-section class="column items-center">
                <q-avatar icon="all_inbox" class="q-mb-md" color="deep-purple-13" text-color="white" />
                    <div class="q-ml-sm text-weight-bold text-subtitle1">Necesitamos su confirmación</div>
                </q-card-section>

                <q-card-actions align="right">
                <q-btn flat label="Volver" color="black"  v-close-popup />
                <q-btn 
                flat 
                label="Confirmar"  
                color="deep-purple-13" 
                v-close-popup
                @click="confirmarEntregaPaquete"
                 />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <dialog-loading :open="cargandoActualizarEstado" text="Cargando paquete" />

        <!-- realizado correctamente -->
        <q-dialog
        v-model="mostrarRespuestaInformacion"
        persistent
        :maximized="maximizedToggle"
        transition-show="slide-up"
        transition-hide="slide-down"
        >
            <q-card class="text-black flex column justify-between items-center q-pa-sm bg-green-14" style="height:100vh;">
                <div class="flex column justify-center items-center q-my-lg">
                    <div>
                    <q-icon 
                    name="check_circle_outline" 
                    color="white"
                    size="lg"
                    class="q-mb-lg"
                    />
                    </div>
                    <div class="text-center q-mb-lg" >
                        <span class="text-white text-h4">Realizado correctamente</span>
                    </div>
                    <div>
                        <q-icon 
                        name="inventory" 
                        color="white"
                        size="xl"
                        class="q-mb-lg"
                        />
                    </div>
                </div>
                <div :class="[breakpoint?.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-lg']" >
                    <q-btn
                    unelevated 
                    rounded 
                    color="white"
                    label="Seguir recorrido" 
                    type="buttom"
                    class="full-width text-black"
                    @click="router.push({name: 'recorrido', params: { recorrido_id: recorrido_id}})"
                    />
                </div>
                
            </q-card>
        </q-dialog>

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
import ItemRepository from 'src/repositories/Item.repository'
import { ParadaModel } from 'src/models/Parada.model';
import { ItemModel } from 'src/models/Item.model';
import GoogleIframeMap from 'src/components/General/GoogleIframeMap.vue';
import DialogLoading from 'src/components/General/DialogLoading.vue'
import { ITEMS_ESTADOS, ITEMS_TIPOS, PARADA_ESTADOS } from 'src/utils/DataProviders'
import { useQuasar } from 'quasar';
import { useUsuarioStore } from 'src/stores/Usuario'

const emit = defineEmits<{
  (e: 'actualizarEstadoParada', value: ParadaModel): void
}>()

const paradaRepository = new ParadaRepository();
const itemRepository = new ItemRepository();

const usuarioStore = useUsuarioStore()

const route = useRoute();

const {
  parada_id,
  recorrido_id
} = route.params

const $q = useQuasar();
const breakpoint = computed(() => $q.screen)

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
            incluir: [
                'items.itemEstado', 
                'items.cliente',
                'items.cliente.tipoDocumento', 
                'items.itemProveedor', 
                'items.itemTipo', 
                'items.empresa',
                'paradaEstado'
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

const navegar = async (lat: string, lng: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url);

    if(parada.value?.parada_estado.codigo === 'visitado'){
        return 
    }

    const [item] = items.value
    const { id } = item;
    const request = {
        item_estado_id: ITEMS_ESTADOS.EN_CAMINO,
        parada_id: parada.value?.id as number
    }
    await itemRepository.updateEstado(request, id);
}

const abrirConfirmar = ref<boolean>(false)
const cargandoActualizarEstado = ref<boolean>(false)
const mostrarRespuestaInformacion = ref<boolean>(false)

const confirmarEntregaPaquete = async () => {
    abrirConfirmar.value = false
    if(items.value.length === 0){
        await visitarParada()
    } else {
        const [item] = items.value
        const { id } = item;
        const item_estado_id = item.item_tipo_id === ITEMS_TIPOS.ENTREGA ? ITEMS_ESTADOS.ENTREGADO : ITEMS_ESTADOS.RETIRADO
        const request = {
            item_estado_id,
            parada_id: parada.value?.id as number,
        }

        try {
            cargandoActualizarEstado.value = true;
            const response = await itemRepository.updateEstado(request, id);
            mostrarRespuestaInformacion.value = true
            actualizarEstadoParada(response)
            
        } catch (error) {
            
        } finally {
            cargandoActualizarEstado.value = false;
        }
    }
}

const visitarParada = async () => {
    if(parada.value){
      try {
        const { usuario: { id } } = usuarioStore
        cargandoActualizarEstado.value = true;
        const request = {
            parada_estado_id: PARADA_ESTADOS.VISITADO,
            rider_id: id
        }
        const response = await paradaRepository.updateEstado(request, parada.value.id);
        if(response.parada){
            emit('actualizarEstadoParada', response.parada)
            mostrarRespuestaInformacion.value = true
        }
        
      } catch (error) {
        
      } finally {
            cargandoActualizarEstado.value = false;
        }
    }
}

// const paqueteEntregable = computed(() => true)

const paqueteEntregable = computed(() => (items.value.length === 0 && parada.value?.parada_estado.codigo !== 'visitado') ||  
    items.value.some((i) => i.item_estado.codigo !== 'entregado' && i.item_estado.codigo !== 'retirado')
)

const actualizarEstadoParada = (item: ItemModel) => {
    if(item.parada){
        emit('actualizarEstadoParada', item.parada)
    }
}

</script>

<style scoped>
.q-chip {
    margin: 0px;
}
</style>