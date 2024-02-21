<template>
    <q-card class="text-black flex column no-wrap justify-between"  >
        <div>
            <div class="full-width q-pa-sm">
            <q-icon 
            @click="emit('close', true)" 
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

            <q-list  bordered class="text-black q-my-sm q-py-xs">
                <q-item class="item-list" >
                    <q-item-section class="text-weight-medium" >Estado</q-item-section>
                    <q-chip dense :style="`background:${item.item_estado.color};margin:0;color:white;`" square >
                        {{ item.item_estado.nombre  }} 
                    </q-chip>
                    
                </q-item>
                <template v-if="item.parada">
                <q-item class="item-list" >
                    <q-item-section class="text-weight-medium" >Direccion</q-item-section>
                    <q-item-section avatar>
                        {{ $q.platform.is.mobile ? item.parada.direccion_formateada.substring (0,35): item.parada.direccion_formateada  }} 
                    </q-item-section>
                </q-item>
                <q-item class="item-list" >
                    <q-item-section class="text-weight-medium" >Localidad</q-item-section>
                    <q-item-section avatar>
                        {{ item.parada.localidad  }} 
                    </q-item-section>
                </q-item>
                </template>
                <q-item v-if="item.gestionado" class="item-list" >
                    <q-item-section class="text-weight-medium" >Gestionado</q-item-section>
                    <q-item-section avatar>
                        {{ item.gestionado_transformado  }} 
                    </q-item-section>
                </q-item>
                <q-item v-if="item.created_at" class="item-list" >
                    <q-item-section class="text-weight-medium" >Creado</q-item-section>
                    <q-item-section avatar>
                        {{ item.created_at_transformado  }} 
                    </q-item-section>
                </q-item>
                <q-item v-if="item.track_id" class="item-list">
                    <q-item-section class="text-weight-medium" >Nro envio</q-item-section>
                    <q-item-section avatar>
                        {{ item.track_id  }} 
                    </q-item-section>
                </q-item>
            </q-list>  

            <div v-if="item.comprobantes.length > 0"
            class="q-mx-sm q-mb-sm text-subtitle1 text-weight-medium"
            >
                Comprobantes de paquete
            </div>

            <imagenes-comprobantes 
            modelo="ItemComprobante"
            :comprobantes="item.comprobantes"
            :path-bucket="S3BUCKETLAGUAGUA"
            :imagen-eliminable="false"
            />
        </div>

    </q-card>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import {  ItemModel } from 'src/models/Item.model';
import GoogleIframeMap from 'src/components/General/GoogleIframeMap.vue';
import ImagenesComprobantes from 'src/modules/Recorrido/components/Parada/ImagenesComprobantes.vue';
const S3BUCKETLAGUAGUA : string = process.env.S3BUCKETLAGUAGUA as string

const emit = defineEmits<{
  (e: 'close', data: boolean): void
}>()

interface Props {
    item: ItemModel
}
const props = defineProps<Props>();
const { item } = toRefs(props);

const { parada } = item.value
console.log(item.value)
</script>
<style scoped>

.item-list{
    min-height: 20px;
    padding: 2px 10px;
}

</style>