import { ParadaModel, ParadaRequestModel } from 'src/models/Parada.model';
import request from 'src/utils/ApiResponseCapacitor.util';
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

    async getTiposItems() {
      try {
        const response = await request({
          url: API_BASE_URL + `/api/tipos-items`,
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
          url: API_BASE_URL + `/api/proveedores-items`,
          method: 'GET',
          auth: true
        });
   
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

}