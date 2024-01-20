
import { ref, onMounted, onUnmounted } from 'vue'
import DataProviderRepository from 'src/repositories/DataProvider.repository'

const dataProviderRepository = new DataProviderRepository();

const tiposDocumentos = ref<any>([])
const codigosArea = ref<any>([])
const empresas = ref<any>([])
const tiposItems = ref<any>([])
const proveedoresItems = ref<any>([])

export function useDataProvider() {

   const getTipoDocumentos = async () => {
    if(tiposDocumentos.value.length === 0){
        const response = await dataProviderRepository.getTiposDocumentos();
        tiposDocumentos.value = response;
        console.log(tiposDocumentos.value)
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

   const getTiposItems = async () => {
    if(tiposItems.value.length === 0){
        const response = await dataProviderRepository.getTiposItems();
        tiposItems.value = response;
        return tiposItems.value
    } else {
        return tiposItems.value
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

  return { 
    getTipoDocumentos,
    tiposDocumentos,
    getCodigosArea,
    codigosArea,
    getEmpresas,
    empresas,
    getTiposItems,
    tiposItems,
    getProveedoresItems,
    proveedoresItems
   }
}