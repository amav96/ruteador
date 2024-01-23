
import { ref, onMounted, onUnmounted } from 'vue'
import DataProviderRepository from 'src/repositories/DataProvider.repository'
import { EmpresaModel } from 'src/models/Empresa.model';

const dataProviderRepository = new DataProviderRepository();

const tiposDocumentos = ref<any>([])
const codigosArea = ref<any>([])
const empresas = ref<EmpresaModel[]>([])
const itemsTipos = ref<any>([])
const proveedoresItems = ref<any>([])
const itemsEstados = ref<any>([])
const paradasEstados = ref<any>([])

export function useDataProvider() {

   const getTipoDocumentos = async () => {
    if(tiposDocumentos.value.length === 0){
        const response = await dataProviderRepository.getTiposDocumentos();
        tiposDocumentos.value = response;
        return tiposDocumentos.value
    } else {
        return tiposDocumentos.value
    }
   } 

   const getCodigosArea = async () => {
    if(codigosArea.value.length === 0){
        const response = await dataProviderRepository.getCodigosArea();
        codigosArea.value = response;
        return codigosArea.value
    } else {
        return codigosArea.value
    }
   } 

   const getEmpresas = async () => {
    if(empresas.value.length === 0){
        const response = await dataProviderRepository.getEmpresas();
        empresas.value = response;
        return empresas.value
    } else {
        return empresas.value
    }
   } 

   const getItemsTipos = async () => {
    if(itemsTipos.value.length === 0){
        const response = await dataProviderRepository.getItemsTipos();
        itemsTipos.value = response;
        return itemsTipos.value
    } else {
        return itemsTipos.value
    }
   }

   const getProveedoresItems = async () => {
    if(proveedoresItems.value.length === 0){
        const response = await dataProviderRepository.getProveedoresItems();
        proveedoresItems.value = response;
        return proveedoresItems.value
    } else {
        return proveedoresItems.value
    }
   }

   const getItemsEstados = async (params: any = {}) => {
    if(itemsEstados.value.length === 0){
        const response = await dataProviderRepository.getItemsEstados(params);
        itemsEstados.value = response;
        return itemsEstados.value
    } else {
        return itemsEstados.value
    }
   }

   const getParadasEstados = async (params: any = {}) => {
    if(paradasEstados.value.length === 0){
        const response = await dataProviderRepository.getParadasEstados(params);
        paradasEstados.value = response;
        return paradasEstados.value
    } else {
        return paradasEstados.value
    }
   }

  return { 
    getTipoDocumentos,
    tiposDocumentos,
    getCodigosArea,
    codigosArea,
    getEmpresas,
    empresas,
    getItemsTipos,
    itemsTipos,
    getProveedoresItems,
    proveedoresItems,
    itemsEstados,
    getItemsEstados,
    paradasEstados,
    getParadasEstados
   }
}