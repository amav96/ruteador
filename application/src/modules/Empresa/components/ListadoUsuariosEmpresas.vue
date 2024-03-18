<template>
    <q-card 
    style="border-radius:10px;" 
    flat  
    class="bg-white text-white rounded-xs q-mt-md "
    v-for="(usuarioEmpresa, index) in usuariosEmpresas"
    :key="index"
    >
        <q-list  bordered class="text-black q-my-sm">
            <q-item style="padding:4px 16px" v-if="mostrarEmpresa" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Empresa</q-item-label>
                    <q-item-label class="text-subtitle2"> {{ usuarioEmpresa.empresa.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarUsuario" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Usuario</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ usuarioEmpresa.usuario.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarInvitador &&  usuarioEmpresa.invitacion" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Invitador</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ usuarioEmpresa.invitacion.invitador.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarRol" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Rol</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ usuarioEmpresa.rol.nombre }} </q-item-label>
                </q-item-section>
            </q-item>

            <q-item style="padding:4px 16px" v-if="usuarioEmpresa.deleted_at" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Terminada en </q-item-label>
                    <q-item-label class="text-subtitle2" > {{ usuarioEmpresa.deleted_at.substring(0,10) }} </q-item-label>
                </q-item-section>
            </q-item>
           
        </q-list> 
        <q-card-actions 
        v-if="!usuarioEmpresa.deleted_at && usuarioEmpresa.usuario_id !== usuario.id "
        class="text-black" align="center">
            <q-btn 
            @click="terminarRelacion(usuarioEmpresa)"
            >
                Terminar relacion
            </q-btn>
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { UsuarioEmpresaModel } from 'src/models/UsuarioEmpresa.model';
import { useUsuarioStore } from 'src/stores/Usuario';
import { computed, toRefs } from 'vue';


const emit = defineEmits<{
  (e: 'terminar-relacion', usuarioEmpresa: UsuarioEmpresaModel): void,
}>()

interface Props {
    usuariosEmpresas: UsuarioEmpresaModel[],
    camposMostrar?: string[],
}

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const props = withDefaults(defineProps<Props>(),{
    camposMostrar : () =>  ['empresa' ,'invitador' ,'invitado' ,'rol' ,'estado']
})
const { usuariosEmpresas, camposMostrar } = toRefs(props);

const usuarioStore = useUsuarioStore()
const { usuario } = storeToRefs(usuarioStore);

const mostrarEmpresa = computed(() => camposMostrar.value.some((c) => c === 'empresa'))
const mostrarInvitador = computed(() => camposMostrar.value.some((c) => c === 'invitador'))
const mostrarRol = computed(() => camposMostrar.value.some((c) => c === 'rol'))
const mostrarUsuario = computed(() => camposMostrar.value.some((c) => c === 'usuario'))

const terminarRelacion = (usuarioEmpresa : UsuarioEmpresaModel) => {
    $q.dialog({
        title: '¿Estas seguro?',
        message: 'Necesitamos su confirmación',
        cancel: {
          push: true,
          color: 'grey-8'
        },
        ok: {
          push: true,
          color: 'deep-purple-13',
        },
        persistent: true
      }).onOk(async () => {
        emit('terminar-relacion', usuarioEmpresa)
      })
}


</script>

<style scoped>

</style>