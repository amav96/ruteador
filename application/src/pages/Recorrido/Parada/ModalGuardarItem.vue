<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-black q-pa-md flex justify column no-wrap items-center" style="height:100vh;">

        <div class="q-mb-lg full-width">
            <q-btn 
            @click="router.push({name: 'parada'})" 
            round 
            size="sm" 
            color="deep-purple-13" 
            icon="arrow_back" 
            />
        </div>

        <div    
        :class="['flex row justify-between text-weight-bold text-h6 q-mb-xs cursor-pointer', breakpoint.xs ? 'full-width' : '']">
            <div
            @click="mostrarInformacionPaquete = !mostrarInformacionPaquete" 
            >
                Paquete
            </div>
            <div>
                <q-icon 
                @click="mostrarInformacionPaquete = !mostrarInformacionPaquete" 
                :name="`${mostrarInformacionPaquete ? 'expand_more' : 'expand_less' }`" 
                />
            </div>
        </div>

        <div class="full-width justify-center items-center flex column" v-show="mostrarInformacionPaquete">
            <form-item ref="formItemRef"/> 
        </div>
        
        <div 
        :class="['flex row justify-between text-weight-bold text-h6 q-my-lg cursor-pointer', breakpoint.xs ? 'full-width' : '']">
            <div 
            @click="mostrarInformacionContacto = !mostrarInformacionContacto" 
            >
                Contacto
            </div>
            <div>
                <q-icon 
                @click="mostrarInformacionContacto = !mostrarInformacionContacto" 
                :name="`${mostrarInformacionContacto ? 'expand_more' : 'expand_less' }`" 
                />
            </div>
        </div>
  
        <div class="full-width justify-center items-center flex column" v-show="mostrarInformacionContacto">
            <contacto-form ref="formContactoRef"/> 
        </div>
        
        <div :class="[breakpoint.xs ? 'full-width' : 'media-width', 'flex justify-center q-my-lg']" >
            <q-btn
            unelevated 
            rounded 
            color="deep-purple-13"
            label="Guardar" 
            type="buttom"
            class="full-width"
            @click="manejarData"
            />
        </div>
            
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import FormItem from 'src/components/Recorrido/Parada/Item/FormItem.vue'
import ContactoForm from 'src/components/Recorrido/Parada/Contacto/ContactoForm.vue'

import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { ItemRequestModel } from 'src/models/Item.model';
import { ContactoRequestModel } from 'src/models/Contacto.model';
import { useUsuarioStore } from 'src/stores/Usuario'
import ItemRepository from 'src/repositories/ItemRepository'

const itemRepository = new ItemRepository()

const usuarioStore = useUsuarioStore()

const $q = useQuasar()
const breakpoint = computed(() => $q.screen)

const route = useRoute();
const router = useRouter();

const mostrarInformacionContacto = ref<boolean>(true)
const mostrarInformacionPaquete = ref<boolean>(true)

const dialog =  ref(true)
const maximizedToggle =  ref(true)

const formItemRef = ref<any>(null)
const formContactoRef = ref<any>(null)

const manejarData = () => {
    let itemForm: ItemRequestModel | null = null;
    let contactoForm: ContactoRequestModel | null = null;

    const {
        usuario : { id: usuarioId }
    } = usuarioStore

    if(formItemRef.value && 'itemForm' in formItemRef.value){
        itemForm = formItemRef.value.itemForm
    }

    if(formContactoRef.value && 'contactoForm' in formContactoRef.value){
        contactoForm = formContactoRef.value.contactoForm
    }

    if(contactoForm && itemForm && usuarioId) {
      
        itemForm.rider_id = usuarioId
        itemForm.parada_id = Number(route.params.parada_id) 

        contactoForm.empresa_id = itemForm.empresa_id

        if(contactoGuardable(contactoForm)){
            console.log('guardar contacto primero')
        } else {
            itemForm.destinatario = contactoForm.nombre ?? itemForm.destinatario
            guardarItem(itemForm)
        }
    }

}

const contactoGuardable = (contacto: ContactoRequestModel ) : boolean => {
    const {
        tipo_documento_id,
        numero_documento,
    } = contacto

    return !!tipo_documento_id && numero_documento !== null && numero_documento !== undefined;
}

const guardarContacto = async (contacto: ContactoRequestModel) => {

}

const guardarItem = async (item : ItemRequestModel) => {
    const response = await itemRepository.create(item);
    console.log(response)
}

</script>