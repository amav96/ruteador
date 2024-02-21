<template>
    <q-page class="full-height bg-white">
        <div class="full-width q-pa-sm row items-center">
            <q-icon 
            name="arrow_back" 
            color="deep-purple-13"
            size="sm"
            class="cursor-pointer"
            @click="router.push({name: 'items-tablero', params: { usuario_id : usuario.id}})"
            />
            <div class="q-mx-md text-h6">
                Datos personales
            </div>
        </div>
        
        <div v-if="usuarioActual" >
            <q-list bordered separator>
                <q-item >
                    <q-item-section>
                        <q-item-label overline> Nombre </q-item-label>
                        <q-item-label> {{ usuarioActual.nombre }} </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item >
                    <q-item-section>
                        <q-item-label overline> Correo </q-item-label>
                        <q-item-label> {{ usuarioActual.email }} </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item >
                    <q-item-section>
                        <q-item-label overline> Pais </q-item-label>
                        <q-item-label> {{ usuarioActual.pais.nombre }} </q-item-label>
                    </q-item-section>
                </q-item>

            </q-list>
            <div class="full-width q-pa-sm">
                <q-btn 
                @click="dialogEditarUsuario = !dialogEditarUsuario"
                class="full-width" 
                label="Modificar datos" 
                color="deep-purple-13" 
                unelevated 
                :disabled="trayendoUsuario"
                />
            </div>
        </div>

        <q-dialog
        v-model="dialogEditarUsuario"
        persistent
        :maximized="true"
        transition-show="slide-up"
        transition-hide="slide-down"
        >
            <q-card class="full-width">
                <div class="flex row items-center q-py-xs">
                    <q-icon 
                    name="arrow_back" 
                    color="deep-purple-13" 
                    size="sm"
                    class="q-ma-sm cursor-pointer"
                    @click="dialogEditarUsuario = !dialogEditarUsuario"
                    />
                    <div class="q-mx-sm text-h6">
                        Modificar mis datos
                    </div>
                </div>
                <q-separator />

                <q-form 
                class="flex column q-px-sm full-width"
                @submit="actualizarUsuario"
                >
                    <div class="flex column flex-center full-width">
                        <div :class="['full-width']" >
                            <q-input 
                            v-model="formUsuario.nombre" 
                            color="deep-purple-6" 
                            label="Nombre"
                            autocomplete="off"
                            :rules="[ val => val && val.length > 0 || 'Ingrese nombre']" 
                            />
                        </div>
                        <div :class="['full-width']" >
                        <q-select
                        label="Pais"
                        color="deep-purple-6"
                        v-model="formUsuario.pais_id"
                        :options="paises"
                        option-label="nombre"
                        option-value="id"
                        emit-value
                        map-options
                        >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                                </q-item-section>
                                <q-item-section avatar>
                                    <q-avatar>
                                        <img :src="`https://flagsapi.com/${scope.opt.bandera}/flat/64.png`">
                                    </q-avatar>
                                </q-item-section>
                            </q-item>
                        </template>
                        </q-select>
                        </div>
                        
                    </div>

                    <div class="flex justify-center q-my-lg ">
                        <q-btn
                        :class="['full-width']"
                        unelevated 
                        color="deep-purple-13" 
                        label="Guardar" 
                        type="submit"
                        :loading="actualizandoUsuario"
                        :disabled="actualizandoUsuario"
                        />
                    </div>
                </q-form>

            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts" >
import { UsuarioModel, UpdateUsuarioRequest } from 'src/models/Usuario.model';
import UsuarioRepository from 'src/repositories/Usuario.repository';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from 'src/stores/Usuario'
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { reactive } from 'vue';
import { useDataProvider } from 'src/composables/DataProvider';

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const usuarioStore = useUsuarioStore()

const { usuario } = usuarioStore;

const usuarioRepository = new UsuarioRepository()

const route = useRoute();
const router = useRouter();
const usuarioId = computed(() => route.params.usuario_id)
const usuarioActual = ref<UsuarioModel | null>(null)

onMounted(() => {
    getUsuario();
})

const trayendoUsuario = ref<boolean>(false)
const getUsuario = async () => {
    try {

        trayendoUsuario.value = true;
        const response = await usuarioRepository.get({
            usuario_id: usuarioId.value,
            incluir: ['pais']
        }) as unknown as UsuarioModel[];
        const [usuarioServer] = response;
        usuarioActual.value = usuarioServer
        formUsuario.nombre = usuarioActual.value.nombre
        formUsuario.pais_id = usuarioActual.value.pais_id
    } catch (error) {
        
    } finally{
        trayendoUsuario.value = false;
    }
}

const {
    paises,
    getPaises,
} = useDataProvider()

onMounted(async() => {
    await getPaises()
})

const dialogEditarUsuario = ref<boolean>(false);

const formUsuario = reactive<UpdateUsuarioRequest>({
    nombre: '',
    pais_id: 1
})

const actualizandoUsuario = ref<boolean>(false)
const actualizarUsuario = async () => {
    try {
        actualizandoUsuario.value = true;
        const response = await usuarioRepository.update(Number(usuarioId.value) ,formUsuario)
        const { nombre, pais_id} = response;
        formUsuario.nombre = nombre;
        formUsuario.pais_id= pais_id
        if(usuarioActual.value){
           
            usuarioActual.value = {
                ...usuarioActual.value,
                ...response
            }
        }
        
    } catch (error) {
        
    } finally{ 
        dialogEditarUsuario.value = false;
        actualizandoUsuario.value = false;
    }
}

</script>