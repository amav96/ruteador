import { storeToRefs } from "pinia"
import { useQuasar } from "quasar"
import { ClienteModel, ClienteRequestModel } from "src/models/Cliente.model"
import { ItemRequestModel } from "src/models/Item.model"
import { ParadaModel } from "src/models/Parada.model"
import ItemRepository from "src/repositories/Item.repository"
import { useRecorridoStore } from "src/stores/Recorrido"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

export default function useGuardarParada() {

    const itemRepository = new ItemRepository()

    const route = useRoute();
    const $q = useQuasar()

    const {
        addressValue = '',
        id = '',
        origin = 0,
        destination = 0,
      } = route.query

    const recorridoStore = useRecorridoStore()
    const { recorrido, paradas } = storeToRefs(recorridoStore)

    const creandoParada = computed(() => !origin && !destination)

    const mostrarInformacionContacto = ref<boolean>(true)
    const mostrarInformacionPaquete = ref<boolean>(true)

    const formItemRef = ref<any>(null)
    const formContactoRef = ref<any>(null)

    const itemForm = ref<ItemRequestModel | null>(null)
    const clienteForm = ref<ClienteRequestModel | null>(null)
    const clientesNumerosForm = ref<any>(null)

    const guardandoCliente = ref<boolean>(false)
    const guardandoItem = ref<boolean>(false)
    const cargandoFomularios = ref<boolean>(false)

    const agregarParada = (data: ParadaModel) => {
 
        paradas.value.unshift(data)
        if(recorrido.value){
          recorrido.value.optimizado = 0;
        }
    }
       
    const clienteGuardable = () : boolean => {
        if(clienteForm.value){
    
        const {
            tipo_documento_id,
            numero_documento,
            nombre
        } = clienteForm.value
    
        return (!!tipo_documento_id && numero_documento !== null && numero_documento !== undefined) || 
                (clientesNumerosForm.value.some((numero: any) => numero.numero !== null) || nombre)
        }
    
        return false;
    }
    
    const crearCliente = async () : Promise<ClienteModel | null> => {
        let response = null
        guardandoCliente.value = true;
        try {
            
            // @ts-ignore
            clienteForm.value.clientes_numeros = clientesNumerosForm.value.filter((n: any) => n.numero !== undefined && n.numero !== null&&  n.numero !== '')
            // @ts-ignore
            response = await clienteRepository.create(clienteForm.value)
    
        } catch (error) {
            console.log(error)
        } finally {
            guardandoCliente.value = false;
        }
        return response
    }
    
    const crearItem = async (cliente_id?: number | null) => {
        if(itemForm.value){
            try {
                guardandoItem.value = true;
                if(cliente_id){
                    itemForm.value.cliente_id = cliente_id
                }
                const response = await itemRepository.create(itemForm.value);
                
            } catch (error  : any) {
                const { data } = error;
                let mensaje = data && data.message ?  data.message : 'No se creo correctamente';
                $q.notify({
                    type: 'negative',
                    message: mensaje,
                    position: 'top',
                    timeout: 15000
                })
                guardandoItem.value = false;
            }
        } 
    }
    

    return {
        agregarParada,
        clienteGuardable,
        crearCliente,
        crearItem,
        creandoParada,
        mostrarInformacionContacto,
        mostrarInformacionPaquete,
        formItemRef,
        formContactoRef,
        itemForm,
        clienteForm,
        clientesNumerosForm,
        guardandoCliente,
        guardandoItem,
        cargandoFomularios,
    }

}