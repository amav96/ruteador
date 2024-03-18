<template>
    <q-card 
    style="border-radius:10px;" 
    flat  
    class="bg-white text-white rounded-xs q-mt-md "
    v-for="(invitacion, index) in invitaciones"
    :key="index"
    >
        <q-list  bordered class="text-black q-my-sm">
            <q-item style="padding:4px 16px" v-if="mostrarEmpresa" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Empresa</q-item-label>
                    <q-item-label class="text-subtitle2"> {{ invitacion.empresa.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarInvitador" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Invitador</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ invitacion.invitador.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarInvitado && invitacion.invitado?.nombre"  >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Invitado</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ invitacion.invitado.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarRol" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Rol</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ invitacion.rol.nombre }} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarEstado" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Estado</q-item-label>
                    
                    <q-item-label class="text-subtitle2" > 
                        <q-chip  :style="`background:${invitacion.estado.color};margin:4px 0px;`" text-color="white" >
                            {{ invitacion.estado.nombre }} 
                        </q-chip>
                    </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarEmailInvitado" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Email invitado</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ invitacion.email_invitado}} </q-item-label>
                </q-item-section>
            </q-item>
            <q-item style="padding:4px 16px" v-if="mostrarFechaCreada" >
                <q-item-section>
                    <q-item-label class="text-weight-light" >Creada</q-item-label>
                    <q-item-label class="text-subtitle2" > {{ invitacion.created_at.substring(0,10)}} </q-item-label>
                </q-item-section>
            </q-item>

            
        </q-list> 
        <q-card-actions 
        v-if="invitacion.estado.codigo === 'invitado' && usuario && (usuario.email === invitacion.email_invitado || 
        usuario.email === invitacion.email_invitado ||
        usuario.id === invitacion.invitador_id)" 
        class="text-black" align="center">
            <q-btn 
            v-if="usuario.email === invitacion.email_invitado"
            @click="aceptarInvitacion(invitacion)" 
            flat>
                Aceptar
            </q-btn>
            <q-btn 
            v-if="usuario.email === invitacion.email_invitado" 
            flat
            @click="rechazarInvitacion(invitacion)"
            >
            Rechazar
            </q-btn>
            <q-btn 
            v-if="usuario.id === invitacion.invitador_id" flat
            @click="eliminarInvitacion(invitacion)"
            >
                Eliminar
            </q-btn>
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { InvitacionEmpresaModel } from 'src/models/InvitacionEmpresa.model';
import { UsuarioModel } from 'src/models/Usuario.model';
import { computed, toRefs } from 'vue';

const emit = defineEmits<{
  (e: 'eliminar-invitacion', invitacion: InvitacionEmpresaModel): void,
  (e: 'aceptar-invitacion', invitacion: InvitacionEmpresaModel): void,
  (e: 'rechazar-invitacion', invitacion: InvitacionEmpresaModel): void,
}>()

interface Props {
    invitaciones: InvitacionEmpresaModel[],
    camposMostrar?: string[],
    usuario: UsuarioModel
}

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const props = withDefaults(defineProps<Props>(),{
    camposMostrar : () =>  ['empresa' ,'invitador' ,'invitado' ,'rol' ,'estado', 'fecha_creada', 'email_invitado']
})
const { invitaciones, camposMostrar, usuario } = toRefs(props);

const mostrarEmpresa = computed(() => camposMostrar.value.some((c) => c === 'empresa'))
const mostrarInvitador = computed(() => camposMostrar.value.some((c) => c === 'invitador'))
const mostrarInvitado = computed(() => camposMostrar.value.some((c) => c === 'invitado'))
const mostrarRol = computed(() => camposMostrar.value.some((c) => c === 'rol'))
const mostrarEstado = computed(() => camposMostrar.value.some((c) => c === 'estado'))
const mostrarEmailInvitado = computed(() => camposMostrar.value.some((c) => c === 'email_invitado'))
const mostrarFechaCreada = computed(() => camposMostrar.value.some((c) => c === 'fecha_creada'))

const eliminarInvitacion = (invitacion : InvitacionEmpresaModel) => {
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
        emit('eliminar-invitacion', invitacion)
       
      })
}

const aceptarInvitacion = (invitacion : InvitacionEmpresaModel) => {
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
        emit('aceptar-invitacion', invitacion)
       
      })
}

const rechazarInvitacion = (invitacion : InvitacionEmpresaModel) => {
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
        emit('rechazar-invitacion', invitacion)
       
      })
}

</script>

<style scoped>

</style>