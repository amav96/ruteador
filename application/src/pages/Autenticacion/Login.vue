<template>
    <q-page>
        <div class="q-pa-md login-container">
            <q-form 
            @submit="onSubmit"
            class="flex column justify-between q-px-md full-height"
            >
                <div class="flex column flex-center full-width">
                    <q-img
                        :src="logo"
                        style="max-width: 130px"
                        class="q-mb-lg q-mt-md"
                    />
                    <div :class="[breakpoint.xs ? 'full-width' : 'small-width']" >
                        <q-input 
                        v-model="formLogin.email" 
                        color="deep-purple-6" 
                        label="Email"
                        autocomplete="off"
                        :rules="[ val => val && isValidEmail(val) || 'Ingrese email válido']" 
                         />
                    </div>
                    <div :class="[breakpoint.xs ? 'full-width' : 'small-width', 'q-my-md']">
                        <q-input 
                        v-model="formLogin.password" 
                        color="deep-purple-6" 
                        label="Clave" 
                        autocomplete="off"
                        :type="isPwd ? 'password' : 'text'"
                        :rules="[ val => val && val.length > 0 || 'Ingrese contraseña']" 
                        >
                            <template v-slot:append>
                                <q-icon
                                    :name="isPwd ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                    </div>
                    <div :class="['text-deep-purple-6 row full-width text-subtitle1', breakpoint.xs ? 'justify-end' : 'justify-center']">
                        <strong>¿Olvidaste tu contraseña?</strong>
                    </div>
                </div>

                <div class="flex justify-center q-my-sm">
                    <q-btn
                    unelevated 
                    rounded 
                    color="deep-purple-6"
                    label="Ingresar a mi cuenta" 
                    type="submit"
                    :disabled="formularioVacio || formLoading"
                    />
                </div>
            </q-form>

            <DialogLoading :open="formLoading" text="Autenticando..." />
        </div>
    </q-page>
</template>

<script setup lang="ts">

import logo from 'src/assets/logo.jpg'
import { ref, computed, reactive } from "vue"
import { useQuasar } from 'quasar'
import { isValidEmail } from 'src/utils/Validations'
import AutenticacionRepository from 'src/repositories/AutenticacionRepository';
import { LoginModel } from 'src/models/Autenticacion.model';
import DialogLoading from 'src/components/general/DialogLoading.vue'
import { useUsuarioStore } from 'src/stores/Usuario'
import { useRouter } from 'vue-router';

const autenticacionRepository = new AutenticacionRepository();
const usuarioStore = useUsuarioStore()

const router = useRouter();

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const formLogin = reactive<LoginModel>({
    email: '',
    password: ''
})
const formLoading = ref<boolean>(false);

const formularioVacio = computed(() => !formLogin.email || !formLogin.password)

const isPwd = ref<boolean>(true);

const onSubmit = async () => {
    formLoading.value = true

    try {

        const response = await autenticacionRepository.login(formLogin)
        const { usuario , token } = response.data;
        if(usuario && token){
            usuarioStore.setUsuario(usuario);
            usuarioStore.setToken(token);
            router.push({name: 'recorridos'})
        }

    } catch (error : any) {
        const { data } = error;
        let mensaje = data && data.message ?  data.message : 'No se puede iniciar correctamente';
        $q.notify({
          type: 'negative',
          message: mensaje,
          position: 'top',
          timeout: 1000
        })
    } finally {
        formLoading.value = false
    }
}

</script>

<style lang="scss" scoped>

.login-container{
    height: 95vh;
}

</style>