<template>
    <q-page class="q-px-md " style="min-height:auto">
        <div class="flex column justify-center items-center q-my-lg">
            <q-img
            class="q-my-md"
            :src="navigator"
            style="max-width: 200px"
            />
            <div class="flex justify-center q-my-md">
                <q-btn
                unelevated 
                rounded 
                color="deep-purple-13"
                label="Crear recorrido" 
                @click="abrirModalFunc"
                />
            </div>
        </div>

        <q-dialog 
        persistent
        v-model="abrirModal" 
        >
            <q-card style="min-width: 350px">
                <q-card-section>
                <div class="text-h6">Momento de inicio</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input color="deep-purple-13" dense type="date" v-model="inicio.dia" />
                    <q-input color="deep-purple-13" dense type="time" step="1" v-model="inicio.hora" />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn 
                    flat 
                    label="Siguiente" 
                    v-close-popup 
                    @click="crearRecorrido"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <DialogLoading :open="crearLoading" text="Creando..." />
    </q-page>
</template>

<script setup lang="ts">

import navigator from 'src/assets/navigator.svg'
import RecorridoRepository from 'src/repositories/Recorrido.repository';
import { useUsuarioStore } from 'src/stores/Usuario'
import DialogLoading from 'src/components/General/DialogLoading.vue'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecorridoStore } from 'src/stores/Recorrido';
import { storeToRefs } from 'pinia';

const recorridoRepository = new RecorridoRepository();

const router = useRouter();

const usuarioStore = useUsuarioStore()
const {
    usuario
} = usuarioStore

const recorridoStore = useRecorridoStore()
const { recorrido, paradas } = storeToRefs(recorridoStore)

const inicio = ref<any>({
    dia: '',
    hora: ''
});

const abrirModal = ref<boolean>(false);

const crearLoading = ref<boolean>(false);
const crearRecorrido = async () => {
    abrirModal.value = false;
    if(usuario){
        try {
            crearLoading.value = true
            const response = await recorridoRepository.create({
                rider_id : usuario.id,
                inicio : inicio.value.dia + ' ' + inicio.value.hora 
            });
          
            // @ts-ignore
            recorrido.value = null
            paradas.value = []
            router.push({name: 'recorrido', params: { recorrido_id : response.recorrido.id}})
              
        } catch (error) {
            
        } finally {
            crearLoading.value = false
        }
    }
}

const abrirModalFunc = () => {
    // Obtén la fecha y hora actual
    const fechaActual = new Date();
    
    // Formatea la fecha al formato 'YYYY-MM-DD'
    const formatoFecha = (fecha: Date) => {
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${fecha.getFullYear()}-${mes}-${dia}`;
    };

    // Formatea la hora al formato 'HH:mm'
    const formatoHora = (fecha: Date) => {
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
       
        return `${hora}:${minutos}`;
    };

    // Establece la fecha y hora actual en las propiedades inicio.dia e inicio.hora
    inicio.value.dia = formatoFecha(fechaActual);
    inicio.value.hora = formatoHora(fechaActual);

    // Abre el modal
    abrirModal.value = true;
};

const cerrarModal = () => {
    console.log(abrirModal.value)
}

</script>