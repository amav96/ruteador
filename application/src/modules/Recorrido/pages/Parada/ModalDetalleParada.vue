<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black flex column no-wrap justify-between"  >
        <div >
            <div class="full-width q-pa-sm">
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

            <!-- navegar -->
            <div v-if="parada" class="flex justify-end q-mx-sm q-mb-xs">
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

            <q-separator spaced style="margin:0px" />
            
            <!-- estado actual -->
            <div v-if="estadoParadaMostrable" class="text-white q-pa-sm q-mb-sm" :style="`background:${parada?.parada_estado.color}`">
                <span class="text-weight-medium" > {{ parada?.parada_estado.nombre }} </span>
            </div>

            <!-- agregar paquete -->
            <div v-if="!trayendoParada && !tieneItems && paqueteEntregable" class="flex column q-pa-sm">
                <div class="flex row items-center q-gutter-x-sm">
                    <div>
                        <span class="text-weight-bold text-h6">Paquete</span>
                    </div> 
                    <div @click="goToAgregarPaquete">
                        <q-btn round size="xs" color="deep-purple-13" icon="add" />
                    </div>
                </div>
            </div>

            <q-separator v-if="tieneItems && parada && parada?.comprobantes.length > 0" spaced />

            <!-- listado de paquetes -->
            <template v-if="tieneItems">
                <div class="flex column items-center full-width ">
                    <div
                    v-for="(item, index) in items"
                    :key="index"
                    class="full-width"
                    >
                        <div class="flex row no-wrap q-pa-sm">
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
                                <div v-if=" item.gestionado_transformado" class="q-mb-xs">
                                    Entregado: <span class="text-weight-medium" >{{ item.gestionado_transformado }}</span>
                                </div>
                                <div class="q-mb-xs" v-if="item.cliente && item.cliente.numero_documento">
                                    <span class="text-weight-medium" >{{ item.cliente.tipo_documento?.nombre }} {{ item.cliente.numero_documento }}</span>
                                </div>
                                <div class="flex text-white " >
                                    <q-chip square  :style="`background:${item.item_estado.color};`" text-color="white" >
                                        {{ item.item_estado.nombre }} 
                                    </q-chip>
                                </div>
        
                            </div>
                            <div v-if="paqueteEntregable && !paqueteGestionado" class="flex justify-end" style="width:10%;">
                                <q-icon @click="goToEditarItemCliente" name="edit" size="sm" />
                            </div>
                            <!-- TODO: mostrar numero tlf, documento -->
                        
                        </div>

                        <div v-if="item.comprobantes.length > 0"
                        class="q-mx-sm q-mb-sm text-subtitle1 text-weight-medium"
                        >
                            Comprobantes de paquete
                        </div>

                        <imagenes-comprobantes 
                        modelo="ItemComprobante"
                        :comprobantes="item.comprobantes"
                        :path-bucket="S3BUCKETLAGUAGUA"
                        :imagen-eliminable="!paqueteGestionado"
                        @actualizar-comprobantes="item.comprobantes = $event"
                        />
                           
                        <div v-if="!paqueteGestionado" class="flex row items-center q-gutter-x-sm q-px-sm q-my-sm">
                            <div>
                                <q-icon size="sm" name="photo_camera" />
                            </div> 
                            <div @click="takePicture(item)" >
                                <q-btn round size="xs" color="deep-purple-13" icon="add" />
                            </div>
                        </div>
                        <!-- <q-separator spaced  style="margin:0px" /> -->
                    </div>
                </div>
            </template>
        </div>

        <!-- agregando comprobante -->
        <dialog-loading :open="cargandoComprobante" text="Cargando comprobante" />

        <!-- acciones  -->
        <div v-if="!cargandoActualizarEstado && paqueteEntregable" class="flex column q-pa-sm">
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
            @click="abrirSeleccionarMotivoNegativo = !abrirSeleccionarMotivoNegativo"
            />
        </div> 
        <div v-else class="flex column q-pa-sm" >
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
                @click="notificarItemPositivo"
                 />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- motivos de negativo -->
        <q-dialog 
        v-model="abrirSeleccionarMotivoNegativo" 
        persistent
        :maximized="true"
        >
            <q-card>
                <div class="full-width q-pa-sm">
                    <q-icon 
                    @click="abrirSeleccionarMotivoNegativo = !abrirSeleccionarMotivoNegativo" 
                    name="arrow_back" 
                    color="deep-purple-13"
                    size="sm"
                    />
                </div>
                <q-card-section>
                    <div class="text-h6">Seleccione el motivo</div>
                </q-card-section>
                
                <q-list  bordered separator >
                    <q-item  
                    v-for="(estado, index) in itemEstadosFiltrados"
                    :key="index"
                    clickable 
                    v-ripple
                    @click="items.length > 0 ? notificarItemNegativo(estado) : notificarParadaNegativa(estado)"
                    >
                        <q-item-section>{{ estado.nombre }}</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>

        <dialog-loading :open="cargandoActualizarEstado" text="Cargando paquete" />

        <!-- realizado correctamente -->
        <modal-respuesta-accion
        :open="mostrarMensajePositivo"
        :recorrido_id="Number(recorrido_id)"
        />

        <modal-respuesta-accion
        :open="mostrarMensajeNegativo"
        bg-color="bg-red-13"
        :recorrido_id="Number(recorrido_id)"
        />

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
import { ParadaEstadoModel, ParadaModel, } from 'src/models/Parada.model';
import { ItemModel, ItemEstadoModel, UrlTemporariaItemComprobanteResponseModel } from 'src/models/Item.model';
import GoogleIframeMap from 'src/components/General/GoogleIframeMap.vue';
import DialogLoading from 'src/components/General/DialogLoading.vue'
import { ITEMS_ESTADOS, ITEMS_TIPOS } from 'src/utils/DataProviders'
import {useDataProvider} from 'src/composables/DataProvider'
import ModalRespuestaAccion from '../../components/Parada/ModalRespuestaAccion.vue';
import ImagenesComprobantes from '../../components/Parada/ImagenesComprobantes.vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { uploadFileToS3 } from 'src/utils/AWS'
import { getId } from 'src/utils/Util';
import { base64ToFile, compressImage } from 'src/utils/Image';
import { useUsuarioStore } from 'src/stores/Usuario'

const usuarioStore = useUsuarioStore()

const emit = defineEmits<{
  (e: 'actualizarEstadoParada', value: ParadaModel): void
}>()

const S3BUCKETLAGUAGUA : string = process.env.S3BUCKETLAGUAGUA as string

const paradaRepository = new ParadaRepository();
const itemRepository = new ItemRepository();

const route = useRoute();
const router = useRouter();

const {
  parada_id,
  recorrido_id
} = route.params

const { 
    itemsEstados,
    getItemsEstados,
    getParadasEstados
} = useDataProvider()

const itemEstadosFiltrados = computed(() => itemsEstados.value.filter((i: ItemEstadoModel) => i.tipo === 'negativo'))

const dialog =  ref(true)
const maximizedToggle =  ref(true)

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
                'items.comprobantes',
                'paradaEstado',
                'comprobantes'
            ]
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
    getItemsEstados()
    getParadasEstados({tipo: 'negativo'})
})

const navegar = async (lat: string, lng: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url);
}

const abrirConfirmar = ref<boolean>(false)
const cargandoActualizarEstado = ref<boolean>(false)
const mostrarMensajePositivo = ref<boolean>(false)
const mostrarMensajeNegativo = ref<boolean>(false)
    
const abrirSeleccionarMotivoNegativo = ref<boolean>(false)

const notificarItemPositivo = async () => {
    abrirConfirmar.value = false
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
        mostrarMensajePositivo.value = true
        if(response.parada){
            emit('actualizarEstadoParada', response.parada)
        }
        
    } catch (error) {
        
    } finally {
        cargandoActualizarEstado.value = false;
    }

}

const notificarItemNegativo = async (itemEstado: ItemEstadoModel) => {
   
    abrirConfirmar.value = false
    const [item] = items.value
    const { id } = item;
    const request = {
        item_estado_id: itemEstado.id,
        parada_id: parada.value?.id as number,
    }

    try {
        cargandoActualizarEstado.value = true;
        const response = await itemRepository.updateEstado(request, id);
        mostrarMensajeNegativo.value = true
        if(response.parada){
            emit('actualizarEstadoParada', response.parada)
        }
        
    } catch (error) {
        
    } finally {
        cargandoActualizarEstado.value = false;
    }
}

const notificarParadaNegativa = async (paradaEstado: ParadaEstadoModel) => {
    if(parada.value){
      try {
        const { usuario: { id } } = usuarioStore
        cargandoActualizarEstado.value = true;
        const request = {
            parada_estado_id: paradaEstado.id,
            rider_id: id
        }
        const response = await paradaRepository.updateEstado(request, parada.value.id);
        mostrarMensajeNegativo.value = true
        if(response.parada){
            emit('actualizarEstadoParada', response.parada)
        }
        
      } catch (error) {
        
      } finally {
            cargandoActualizarEstado.value = false;
        }
    }
}

const paqueteEntregable = computed(() => (items.value.length === 0 && parada.value?.parada_estado.codigo !== 'visitado') ||  
    items.value.some((i) => i.item_estado.codigo !== 'entregado' && i.item_estado.codigo !== 'retirado')
)

const paqueteGestionado = computed(() => items.value.length > 0  && 
    items.value.some((i) => i.item_estado.codigo == 'entregado' || i.item_estado.codigo == 'retirado' || i.item_estado.tipo == 'negativo')
)

const estadoParadaMostrable = computed(() => parada.value?.parada_estado.codigo === 'visitado' || parada.value?.parada_estado.tipo === 'negativo')

const takePicture = async (item?: ItemModel) => {
    const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
    });
  if(image.base64String){
    cargandoComprobante.value = true
   try {

    const { base64String, format } = image
  
    const filename = getId() + "." + format; // Combi
    const mimeType = "image/" + format; // Tipo MIME
    
    const file = await compressImage(await base64ToFile(base64String, filename, mimeType));
  
    let formData = new FormData();
    formData.append('file', file, filename);
        
    if(item){
        generarUrlItemComprobante(filename, file, item)
    }
   } catch (error) {
    cargandoComprobante.value = false
   }
  }

};

const cargandoComprobante = ref<boolean>(false)
const generarUrlItemComprobante = async (nombre_archivo: string, file: File, item: ItemModel) => {
    let response : UrlTemporariaItemComprobanteResponseModel | null = null
    try {
        response = await itemRepository.generarUrlTemporariaComprobante({
            nombre_archivo,
            item_id: item.id 
        })
    } catch (error) {
        cargandoComprobante.value = false
    }

    if(response){
        const { storage, comprobante }  = response;
        if(storage){
            try {
                await uploadFileToS3(storage.url, file);
                const { item_id } = comprobante
                const itemIndex = items.value.findIndex((i: ItemModel) => i.id === item_id)
                if(itemIndex > -1){
                    items.value[itemIndex].comprobantes.push(comprobante)
                }
                
            } catch (error) {
                const { id } = comprobante;
                await itemRepository.eliminarItemComprobante(id)
            } finally {
                cargandoComprobante.value = false
            }
        } else {
            cargandoComprobante.value = false
        }
    }
}

</script>

<style scoped>

.q-chip {
    margin: 0px;
}

</style>