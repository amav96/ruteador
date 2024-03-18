<template>
    <div class="bg-white " :style="`padding: 10px; ${ !breakpoint.xs? 'margin-top: 20px; border-radius: 15px;' : ''}`">
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

        <div class="text-h6 q-mb-sm">
            Invita personas
        </div>

        <div>
            Los nuevos miembros podran entregar/retirar tus paquetes
        </div>

        <q-form @submit.prevent="enviarInvitacion" >
            <q-input
            label="Invitar por correo electronico"
            color="deep-purple-6"
            v-model="email_invitado"
            :rules="[ val => val && isValidEmail(val) || 'Ingrese email válido']" 
            />

            <q-select
            label="Rol"
            color="deep-purple-6"
            v-model="rolId"
            :options="roles.filter((r: RolModel) => r.codigo !== 'agencia-repartidor')"
            option-label="nombre"
            option-value="id"
            map-options
            emit-value
            />

            <q-btn
            :class="['full-width q-my-md']"
            rounded 
            color="deep-purple-13"
            :disabled="!email_invitado || !rolId || invitandoUsuario"
            :loading="invitandoUsuario"
            label="Enviar invitación" 
            type="submit"
            />
        </q-form>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted,  ref, toRefs } from 'vue';
import EmpresaRepository from 'src/repositories/Empresa.repository';
import { useQuasar } from 'quasar';
import { isValidEmail } from 'src/utils/Validations';
import { useDataProvider } from 'src/composables/DataProvider';
import InvitacionEmpresaRepository from 'src/repositories/InvitacionEmpresa.repository'
import { useUsuarioStore } from 'src/stores/Usuario'
import { storeToRefs } from 'pinia';
import { RolModel } from 'src/models/Rol.model';

const usuarioStore = useUsuarioStore()
const { usuario } = storeToRefs(usuarioStore);

const invitacionEmpresaRepository = new InvitacionEmpresaRepository();

interface Props {
  empresaId: number
}

const props = defineProps<Props>();
const { empresaId } = toRefs(props)

const emit = defineEmits<{
  (e: 'close'): void,
}>()

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const empresaRepository = new EmpresaRepository();

const {
    roles,
    getRoles,
} = useDataProvider()

onMounted(() => {
    getRoles()
})


const email_invitado = ref<string>('')
const rolId = ref<number>(3)
const invitandoUsuario = ref<boolean>(false)
const enviarInvitacion = async () => {
    try {
        invitandoUsuario.value = true;
        const response = await invitacionEmpresaRepository.create({
            empresa_id: empresaId.value,
            email_invitado: email_invitado.value,
            invitador_id: usuario.value.id,
            rol_id : rolId.value
        });
    
        $q.notify({
            type: 'positive',
            message: `${email_invitado.value} ha sido invitado correctamente`,
            position: 'bottom',
            timeout: 3000
        })
        emit("close")

    } catch (error: any) {
        $q.notify({
            type: 'negative',
            message: `${error.data?.message ?? 'No se puede enviar invitacion'}`,
            position: 'bottom',
            timeout: 3000
        })
    } finally {
        invitandoUsuario.value = false;
    }
}

</script>

<style scoped>

</style>