<template>
    <q-dialog
        v-model="mostrarRespuestaInformacion"
        persistent
        :maximized="true"
        transition-show="slide-up"
        transition-hide="slide-down"
        >
            <q-card :class="['text-black flex column justify-between items-center q-pa-sm', bgColor]" style="height:100vh;">
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
</template>

<script setup lang="ts">
import { watch, computed} from 'vue';
import { toRefs } from 'vue';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

interface ModalRespuestaAccionProps {
    open: boolean,
    recorrido_id: number
    text?: string,
    bgColor?: string,
    textColor?: string
    iconTop?: string
    iconBottom?: string
}

const router = useRouter();

const $q = useQuasar();
const breakpoint = computed(() => $q.screen)

const props = withDefaults(defineProps<ModalRespuestaAccionProps>(), {
  open: false,
  text: 'Realizado correctamente',
  bgColor: 'bg-green-14',
  textColor: 'text-white',
  iconTop: 'check_circle_outline',
  iconBottom: 'inventory'
});

const { open, recorrido_id, text, bgColor,textColor , iconTop, iconBottom   } = toRefs(props);

const mostrarRespuestaInformacion = ref<boolean>(false)
watch(open, ( val: boolean) => {
    mostrarRespuestaInformacion.value = val
})

</script>

<style scoped>

</style>