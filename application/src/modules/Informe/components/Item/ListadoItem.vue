<template>
    <q-card 
   
    style="border-radius:15px;" 
    flat  
    class="bg-white text-white q-mx-sm rounded-xs q-mb-sm q-py-xs"
    v-for="(item, index) in items"
    :key="index"
    >
        <q-list  bordered class="text-black ">
            <q-item class="item-list"  v-ripple>
                <q-item-section class="text-weight-medium" >Estado</q-item-section>
                <q-chip dense :style="`background:${item.item_estado.color};margin:0;color:white;`" square >
                    {{ item.item_estado.nombre  }} 
                </q-chip>
                
            </q-item>
            <template v-if="item.parada">
            <q-item class="item-list"  v-ripple>
                <q-item-section class="text-weight-medium" >Direccion</q-item-section>
                <q-item-section avatar>
                    {{ $q.platform.is.mobile ? item.parada.direccion_formateada.substring (0,35): item.parada.direccion_formateada  }} 
                </q-item-section>
            </q-item>
            <q-item class="item-list"  v-ripple>
                <q-item-section class="text-weight-medium" >Localidad</q-item-section>
                <q-item-section avatar>
                    {{ item.parada.localidad  }} 
                </q-item-section>
            </q-item>
            </template>
            <q-item v-if="item.gestionado" class="item-list"  v-ripple>
                <q-item-section class="text-weight-medium" >Gestionado</q-item-section>
                <q-item-section avatar>
                    {{ item.gestionado_transformado  }} 
                </q-item-section>
            </q-item>
            <q-item v-if="item.created_at" class="item-list"  v-ripple>
                <q-item-section class="text-weight-medium" >Creado</q-item-section>
                <q-item-section avatar>
                    {{ item.created_at_transformado  }} 
                </q-item-section>
            </q-item>
            <q-item v-if="item.track_id" class="item-list"  v-ripple>
                <q-item-section class="text-weight-medium" >Nro envio</q-item-section>
                <q-item-section avatar>
                    {{ item.track_id  }} 
                </q-item-section>
            </q-item>
        </q-list>  
    </q-card>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { ItemModel} from 'src/models/Item.model';
import { useQuasar } from 'quasar';
const $q = useQuasar()

export interface Props {
  items: ItemModel[];
}
const props = defineProps<Props>();

const { items } = toRefs(props);

</script>

<style scoped>

.item-list{
    min-height: 20px;
    padding: 2px 10px;
}

</style>