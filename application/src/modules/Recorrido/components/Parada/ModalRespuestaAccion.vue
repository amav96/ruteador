<template>
    <q-dialog
        v-model="mostrarRespuestaInformacion"
        persistent
        :maximized="true"
        transition-show="slide-up"
        transition-hide="slide-down"
        >
            <q-card :class="['text-black flex column justify-between items-center q-pa-sm', bgColor]" >
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
                        <span :class="['text-h4', textColor]">{{ text }}</span>
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
                <div class="full-width">
                    <div :class="[breakpoint?.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-sm']" >
                    <q-btn
                    unelevated 
                    rounded 
                    color="white"
                    label="Listado recorrido" 
                    type="buttom"
                    class="full-width text-black"
                    @click="router.push({name: 'recorrido', params: { recorrido_id: recorrido_id}})"
                    />
                    </div>
                    <div 
                    v-if="siguienteParadaId"
                    :class="[breakpoint?.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-sm']" >
                        <q-btn
                        unelevated 
                        rounded 
                        color="white"
                        label="Siguiente parada" 
                        type="buttom"
                        class="full-width text-black"
                        @click="goToSiguienteParada"
                        />
                    </div>
                </div>
                
            </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import {  computed} from 'vue';
import { toRefs } from 'vue';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { ParadaModel } from 'src/models/Parada.model';
const emit = defineEmits<{
  (e: 'close', data: boolean): void
}>()

interface ModalRespuestaAccionProps {
    // open: boolean,
    recorrido_id: number,
    parada_id: number,
    text?: string,
    bgColor?: string,
    textColor?: string
    iconTop?: string
    iconBottom?: string,
    paradas: ParadaModel[]
}

const router = useRouter();

const $q = useQuasar();
const breakpoint = computed(() => $q.screen)

const props = withDefaults(defineProps<ModalRespuestaAccionProps>(), {
//   open: false,
  text: 'Realizado correctamente',
  bgColor: 'bg-green-14',
  textColor: 'text-white',
  iconTop: 'check_circle_outline',
  iconBottom: 'inventory'
});

const {recorrido_id, text, bgColor,textColor , iconTop, iconBottom, paradas, parada_id   } = toRefs(props);

const mostrarRespuestaInformacion = ref<boolean>(true)
const siguienteParadaId  = computed<number | null>(() => {
    let siguiente = paradas.value.findIndex((p: ParadaModel) => p.id === parada_id.value) + 1
    if(siguiente > -1){
        if(paradas.value[siguiente].parada_estado.codigo !== 'visitado' && paradas.value[siguiente].parada_estado.tipo !== 'negativo'){
            return paradas.value[siguiente].id
        }
    }
    return null;
})

const goToSiguienteParada = () => {
    router.push({name: 'parada', params: { parada_id: siguienteParadaId.value}})
    emit("close", false)
}


</script>

<style scoped>

</style>