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
           
            >
              <q-item-section >
                <div class="flex row no-wrap justify-between">
                  <div  @click="router.push({name: 'recorrido', params: { recorrido_id: recorrido.id}})"   class="flex column justify-center">
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
                  <div>
                    <q-icon size="sm" color="grey-13" name="menu">
                      <q-menu>
                        <q-list  >
                          <q-item @click="descargarInforme(recorrido)" clickable v-close-popup >
                            <q-item-section>Descargar informe</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-icon>
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
        <q-dialog
        v-model="abrirModalPDF"
        persistent
        :maximized="true"
        transition-show="slide-up"
        transition-hide="slide-down"
          >
          <recorrido-pdf
          v-if="recorridoActual"
          :recorrido="recorridoActual"
          @hide="abrirModalPDF = false"
          />
        </q-dialog>
        <dialog-loading :open="cargandoImagenes" text="Genenerando informe..." />
    </div>
</template>

<script setup lang="ts">

import { RecorridoModel, RecorridoPaginacionModel } from 'src/models/Recorrido.model';
import RecorridoRepository from 'src/repositories/Recorrido.repository';
import { useUsuarioStore } from 'src/stores/Usuario';
import RecorridoPdf from 'src/modules/Recorrido/components/RecorridoPDF.vue'
import { computed, watch, onMounted, reactive } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ParadaComprobanteModel, ParadaModel } from 'src/models/Parada.model';
import DialogLoading from 'src/components/General/DialogLoading.vue'


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
            incluir : ['paradas.paradaEstado', 'paradas.comprobantes', 'recorridoEstado'].join(','),
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

const S3BUCKETLAGUAGUA : string = process.env.S3BUCKETLAGUAGUA as string
const skeletonRecorridos = [1,2,3,4,5];

const recorridoActual = ref<RecorridoModel | null>(null)
const cargandoImagenes = ref<boolean>(false)
const descargarInforme = async (recorrido: RecorridoModel) => {
  
  cargandoImagenes.value = true;
  let convertirImagenes = await convertirRecorridoParadasComprobantesABase64(recorrido)
  recorridoActual.value = convertirImagenes;
  abrirModalPDF.value = !abrirModalPDF.value
  cargandoImagenes.value = false;
}

const abrirModalPDF = ref<boolean>(false)

const convertirComprobanteABase64 = async (comprobante: ParadaComprobanteModel) => {
  
  const base64Image = await getBase64Image(`${S3BUCKETLAGUAGUA}${comprobante.path}`);
  return { ...comprobante, base64Image };
};

const convertirParadaComprobantesABase64 = async (parada: ParadaModel) => {
  const comprobantesBase64 = await Promise.all(
    parada.comprobantes.map(async (comprobante) => {
      return await convertirComprobanteABase64(comprobante);
    })
  );
  return { ...parada, comprobantes: comprobantesBase64 };
};

const convertirRecorridoParadasComprobantesABase64 = async (recorrido: RecorridoModel) => {
  const paradasBase64 = await Promise.all(
    recorrido.paradas.map(async (parada) => {
      return convertirParadaComprobantesABase64(parada);
    })
  );
  return { ...recorrido, paradas: paradasBase64 };
};

const getBase64Image = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      const dataURL = canvas.toDataURL('image/jpeg'); // Puedes cambiar el formato según tus necesidades

      resolve(dataURL);
    };

    img.onerror = function (error) {
      console.log(error)
      reject(new Error('Error al cargar la imagen'));
    };
    
    console.log(url)
    img.src = `${url}?_random=${makeid()}`;
  });
};

const makeid = () => {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

</script>

<style scoped>

</style>