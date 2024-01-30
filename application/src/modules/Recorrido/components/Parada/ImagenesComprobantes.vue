<template>
    <div  v-if="comprobantesLocales && comprobantesLocales.length > 0" >
      <div  class="q-gutter-sm row items-start q-px-sm">
        <q-img
        v-for="(comprobante, index) in comprobantesLocales"
        :key="index"
        :src="`${pathBucket}${comprobante.path}`"
        spinner-color="red"
        style="height: 140px; max-width: 150px"
        @click="visibleRef = !visibleRef"
        >
          <q-icon  
          v-if="imagenEliminable"
          class="absolute all-pointer-events" 
          size="25px" 
          name="cancel" 
          color="black" 
          style="top: 8px; 
          right: 8px"
          @click.stop="eliminarComprobante(comprobante)"
          />
        </q-img>
      </div>

      <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="imgsRef"
      :index="indexRef"
      @hide="onHide"
      ></vue-easy-lightbox>
    </div>
</template>

<script setup lang="ts">
import { ItemComprobanteModel } from 'src/models/Item.model';
import { onMounted } from 'vue';
import { toRefs, ref, watch } from 'vue';
import VueEasyLightbox from 'vue-easy-lightbox'
import 'vue-easy-lightbox/external-css/vue-easy-lightbox.css'
import ItemRepository from 'src/repositories/Item.repository'
import { ParadaComprobanteModel } from 'src/models/Parada.model';
import ParadaRepository from 'src/repositories/Parada.repository';

const emit = defineEmits<{
  (e: 'actualizarComprobantes', data: any): void
}>()

interface Props {
  comprobantes: ItemComprobanteModel[] | ParadaComprobanteModel[],
  pathBucket: string,
  modelo: string,
  imagenEliminable: boolean
}

const props = withDefaults(defineProps<Props>(), {
  comprobantes: () => [],
  imagenEliminable: false
});

const { comprobantes, pathBucket, modelo, imagenEliminable } = toRefs(props)

const itemRepository = new ItemRepository();
const paradaRepository = new ParadaRepository();

const comprobantesLocales = ref<ItemComprobanteModel[] | ParadaComprobanteModel[]>([])

onMounted(() => {
  comprobantesLocales.value = comprobantes.value
})

watch(comprobantes, (values: ItemComprobanteModel[] | ParadaComprobanteModel[]) => {
  comprobantesLocales.value = values
}, { deep: true })

const visibleRef = ref(false)
const indexRef = ref(0)
const imgsRef = ref(comprobantes.value.map((comprobante: ItemComprobanteModel | ParadaComprobanteModel) => `${pathBucket.value}${comprobante.path}`))
const onHide = () => (visibleRef.value = false)

const eliminandoComprobante = ref<boolean>(false);
const eliminarComprobante = async (comprobante: ItemComprobanteModel | ParadaComprobanteModel) => {

    if(eliminandoComprobante.value) return
    eliminandoComprobante.value = true;

    const { id } = comprobante;
    try {
      if(modelo.value === 'ItemComprobante'){
        await itemRepository.eliminarItemComprobante(id)
      } else if(modelo.value === 'ParadaComprobante'){
        await paradaRepository.eliminarParadaComprobante(id)
      }
      // @ts-ignore
      comprobantesLocales.value =  comprobantesLocales.value.filter((c: ItemComprobanteModel | ParadaComprobanteModel) => c.id !== id)
      emit("actualizarComprobantes", comprobantesLocales.value)

      imgsRef.value = comprobantesLocales.value.map((comprobante: ItemComprobanteModel | ParadaComprobanteModel) => `${pathBucket.value}${comprobante.path}`)
    } catch (error) {
      
    } finally {
      eliminandoComprobante.value = false;
    }
  
}

</script>

<style scoped>

</style>