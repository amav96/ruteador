import { ParadaModel, ParadaRequestModel } from 'src/models/Parada.model';
import request from 'src/utils/ApiResponse.helper';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class DataProviderRepository {
    async getTiposDocumentos() {
        try {
          const response = await request({
            url: API_BASE_URL + `/api/tipos-documentos`,
            method: 'GET',
            auth: true
          });
     
          return response.data;
    
        } catch (error) {
          throw error
        }
    }

    async getCodigosArea() {
        try {
          const response = await request({
            url: API_BASE_URL + `/api/codigos-area`,
            method: 'GET',
            auth: true
          });
     
          return response.data;
    
        } catch (error) {
          throw error
        }
    }

    async getEmpresas() {
      try {
        const response = await request({
          url: API_BASE_URL + `/api/empresas`,
          method: 'GET',
          auth: true
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async getItemsTipos() {
      try {
        const response = await request({
          url: API_BASE_URL + `/api/items-tipos`,
          method: 'GET',
          auth: true
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async getProveedoresItems() {
      try {
        const response = await request({
          url: API_BASE_URL + `/api/items-proveedores`,
          method: 'GET',
          auth: true
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async getItemsEstados(params: any) {
      try {
        const response = await request({
          url: API_BASE_URL + `/api/items-estados`,
          method: 'GET',
          auth: true,
          params
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async getParadasEstados(params: any){
      try {
        const response = await request({
          url: API_BASE_URL + `/api/paradas-estados`,
          method: 'GET',
          auth: true,
          params
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async getPaises(params: any){
      try {
        const response = await request({
          url: API_BASE_URL + `/api/paises`,
          method: 'GET',
          auth: true,
          params
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async getRoles(params: any){
      try {
        const response = await request({
          url: API_BASE_URL + `/api/roles`,
          method: 'GET',
          auth: true,
          params
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

}