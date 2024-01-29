<template>
    <div class="bg-white " >
        <q-icon
        name="arrow_back" 
        color="deep-purple-13"
        class="cursor-pointer q-ma-sm"
        size="sm"
        @click="emit('hide', false)"
        />
        <div id="element-to-print" class="bg-white q-pa-sm" >
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
            <template
            v-if="recorrido.paradas && recorrido.paradas.length > 0"
            >
                <div class="q-mt-sm text-h5">
                    Paradas
                </div>

                <q-item clickable v-ripple 
                :class="[
                'list-group-item rounded-borders q-my-sm', 
                `bg-white`
                ]"
                v-for="(parada, index) in recorrido.paradas"
                :key="index"
                >
                    <q-item-section >

                        <div  class="flex column justify-center">
                        <div class="flex column text-body1" style="max-width: 85%;">
                        <div  class="text-weight-bold" > Direccion </div> 
                        <div  class="" > {{ parada.direccion_formateada }} </div> 
                        </div>
                        
                        <div class="flex row items-center">
                        <div class="text-body1 text-weight-bold"> Estado </div>
                        <q-chip  
                        :style="`background:${parada.parada_estado.color};`">
                        {{ parada.parada_estado.nombre }} 
                        </q-chip>
                        </div>

                        <div 
                        v-if="parada.comprobantes.length > 0" 
                        class="flex row items-center">
                            <img
                            v-for="(comprobante, index) in parada.comprobantes"
                            :key="index"
                            :src="`${comprobante.base64Image}`"
                            style="height: 400px; max-width: 400px"
                            />
                        </div>

                    </div>

                    </q-item-section>
                </q-item>
            
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, toRefs } from 'vue';
// @ts-ignore
import html2pdf from "html2pdf.js"
import { RecorridoModel } from 'src/models/Recorrido.model';
import { useRouter } from 'vue-router';
const router = useRouter();

interface Props {
    recorrido: RecorridoModel
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'hide', data: boolean ): void
}>()

const { recorrido } = toRefs(props)

onMounted(() => {
    setTimeout(() => {
        descargarInforme()
    }, 100);
})


const descargarInforme = async () => {
    var element = document.getElementById('element-to-print');
    
    var opt = {
        margin:       1,
        filename:     recorrido.value.origen_formateado ? recorrido.value.origen_formateado.replace(/[^a-zA-Z0-9]/g, '') : 'informe',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
        },
    };  
    // const pdf = await html2pdf().from(element).set(opt).outputPdf();
    
    // pdf.save();
    html2pdf().from(element).set(opt).save();
    emit("hide", false)
}

</script>

<style scoped>

</style>