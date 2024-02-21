<template>
    <q-page class="full-height">
        <div class="q-pa-md">
           
            <q-form 
            @submit="onSubmit"
            class="flex column q-px-md "
            >
                <div class="flex column flex-center full-width">
                    <q-img
                        :src="logo"
                        style="max-width: 50px"
                        class="q-mb-lg q-mt-md"
                    />
                    <div class="full-width text-h6 q-mb-lg text-deep-purple-6 text-center">
                        <strong>Ingresar a mi cuenta</strong>
                    </div>
                    
                    <div :class="[breakpoint.xs || breakpoint.sm ? 'full-width' : 'small-width']" >
                        <q-input 
                        v-model="formLogin.email" 
                        color="deep-purple-6" 
                        label="Email"
                        autocomplete="off"
                        :rules="[ val => val && isValidEmail(val) || 'Ingrese email válido']" 
                         />
                    </div>
                    
                    <div :class="[breakpoint.xs || breakpoint.sm ? 'full-width' : 'small-width', 'q-my-md']">
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
                    <!-- <div :class="['text-deep-purple-6 row full-width text-subtitle1', breakpoint.xs ? 'justify-end' : 'justify-center']">
                        <strong>¿Olvidaste tu contraseña?</strong>
                    </div> -->
                    <div @click="router.push({name: 'registrar'})" :class="['text-deep-purple-6 row full-width text-subtitle1', breakpoint.xs ? 'justify-end' : 'justify-center']">
                        <strong>Registrarme</strong>
                    </div>

                    <div :class="[breakpoint.xs || breakpoint.sm ? 'full-width' : 'small-width', 'flex justify-center q-my-lg']" >
                        <q-btn
                        :class="['full-width']"
                        unelevated 
                        rounded 
                        color="deep-purple-6"
                        label="Ingresar a mi cuenta" 
                        type="submit"
                        :disabled="formularioVacio || formLoading"
                        />
                    </div>

                    <div :class="[breakpoint.xs || breakpoint.sm ? 'full-width' : 'small-width', 'flex justify-center']" >
                        <q-btn
                        :class="['full-width text-black']"
                        rounded 
                        color="white"
                        label="Ingresar con Google" 
                        type="button"
                        @click="callback"
                        :disabled="formLoading"
                        >
                            <img style="width: 25px;margin-left: 10px;" :src="google" />
                        </q-btn>
                    </div>
                </div>

                
                <!-- </GoogleLogin> -->
            </q-form>

            <DialogLoading :open="formLoading" text="Autenticando..." />
        </div>
    </q-page>
</template>

<script setup lang="ts">

import logo from 'src/assets/rendereable logo.png'
import { ref, computed, reactive, onMounted } from "vue"
import { useQuasar } from 'quasar'
import { isValidEmail } from 'src/utils/Validations'
import AutenticacionRepository from 'src/repositories/Autenticacion.repository';
import { LoginModel } from 'src/models/Autenticacion.model';
import DialogLoading from 'src/components/General/DialogLoading.vue'
import { useUsuarioStore } from 'src/stores/Usuario'
import { useRouter } from 'vue-router';
import google from 'src/assets/google.png'
import { UsuarioModel } from 'src/models/Usuario.model';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID : string = process.env.GOOGLE_CLIENT_ID as string
onMounted(() => {
  GoogleAuth.initialize({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
    });
});

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
        const { usuario , token } = response;
        if(usuario && token){
            completarLogin(usuario, token)
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

const completarLogin = (usuario: UsuarioModel, token: string) => {
    usuarioStore.setUsuario(usuario);
    usuarioStore.setToken(token);
    router.push({name: 'crear-recorrido'})
}

const callback = async () => {
    
    try {
        const googleData = await GoogleAuth.signIn();
        formLoading.value = true
        
        if(googleData && googleData.authentication){
            const {  accessToken }  = googleData.authentication;
            const response = await autenticacionRepository.googleAuthLogin({token: accessToken})
            const { usuario , token } = response;
            if(usuario && token){
                completarLogin(usuario, token)
            }
        } else {
            $q.notify({
                type: 'negative',
                message: 'No hemos podido iniciar correctamente con google',
                position: 'top',
                timeout: 2000
            })
        }
        
    } catch (error) {
        console.log(error)
    } finally {
        formLoading.value = false
    }
}

</script>

<style lang="scss" scoped>


</style>