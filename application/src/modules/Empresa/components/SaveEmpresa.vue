<template>
    <q-card class="q-pa-sm">
        <div 
        class="full-width q-mb-lg"
        >
            <q-icon 
            name="arrow_back" 
            color="deep-purple-13"
            size="sm"
            @click="emit('close')"
            />
        </div>

        <q-form @submit.prevent="guardarEmpresa" >
            <q-input
            v-model="formEmpresa.nombre"
            color="deep-purple-6" 
            label="Nombre empresa"
            autocomplete="off"
            :rules="[ val => val && val.length > 0 || 'Ingrese nombre de empresa']" 
            />

            <q-btn
            :class="['full-width q-my-md']"
            rounded 
            color="deep-purple-13"
            label="Guardar" 
            type="button"
            :loading="guardandoEmpresa"
            :disabled="guardandoEmpresa || formularioCompleto"
            />
        </q-form>
    </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import EmpresaRepository from 'src/repositories/Empresa.repository';
import { EmpresaCreateRequestModel, EmpresaModel } from 'src/models/Empresa.model';

const empresaRepository = new EmpresaRepository();

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'empresa-creada', empresa: EmpresaModel): void
}>()

const guardandoEmpresa = ref<boolean>(false)
const formEmpresa = reactive<EmpresaCreateRequestModel>({
    nombre: ''
})

const formularioCompleto = computed(() => !!!formEmpresa.nombre)

const guardarEmpresa = async () => {
   try {
    guardandoEmpresa.value = true;
    const response = await empresaRepository.create(formEmpresa);
    emit("empresa-creada", response);
    emit("close")
   } catch (error) {
    
   } finally {
    guardandoEmpresa.value = false;
   }

}

</script>

<style scoped>

</style>