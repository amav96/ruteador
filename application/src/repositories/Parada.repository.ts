import { ParadaEstadoRequestModel, ParadaModel, ParadaRequestModel, UrlTemporariaParadaComprobanteRequestModel, UrlTemporariaParadaComprobanteResponseModel } from 'src/models/Parada.model';
import request from 'src/utils/ApiResponse.helper';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class ParadaRepository {
    async create(data: ParadaRequestModel): Promise<{parada: ParadaModel}> {
        try {
            const response = await request({
              url: API_BASE_URL + '/api/paradas',
              method: 'POST',
              data,
              auth: true
            });
      
            return response.data;
      
          } catch (error) {

            throw error
          }
    }

    async update(data: ParadaRequestModel, paradaId: number | string): Promise<{parada: ParadaModel}> {
      try {
          const response = await request({
            url: API_BASE_URL + '/api/paradas/' + paradaId,
            method: 'PUT',
            data,
            auth: true
          });
    
          return response.data;
    
        } catch (error) {
          console.log(error)
          throw error
        }
    }

    async updateEstado(data: ParadaEstadoRequestModel, paradaId: number | string): Promise<{parada: ParadaModel}> {
      try {
          const response = await request({
            url: API_BASE_URL + '/api/paradas/estado/' + paradaId,
            method: 'PATCH',
            data,
            auth: true
          });
    
          return response.data;
    
        } catch (error) {
          throw error
        }
    }

    async getParada(params: any, paradaId : string) : Promise<ParadaModel[]> {
      try {
        const response = await request({
          url: API_BASE_URL + '/api/paradas/' + paradaId,
          method: 'GET',
          auth: true,
          params
        });
  
        return response.data;
  
      } catch (error) {
        throw error
      }
    }

    async delete(paradaId: number | string): Promise<{id: number}> {
      try {
          const response = await request({
            url: API_BASE_URL + '/api/paradas/' + paradaId,
            method: 'DELETE',
            auth: true
          });
    
          return response.data;
    
        } catch (error) {
          throw error
        }
    }

    async eliminarParadaComprobante(parada_comprobante_id: number){
      try {
        const response = await request({
          url: API_BASE_URL + '/api/paradas-comprobantes/delete/' + parada_comprobante_id,
          method: 'DELETE',
          auth: true
        });
        return response.data;
  
      } catch (error) {
        throw error
      }
    }
  
    async generarUrlTemporariaComprobante(data: UrlTemporariaParadaComprobanteRequestModel)
    :Promise< UrlTemporariaParadaComprobanteResponseModel> {
  
      try {
        const response = await request({
          url: API_BASE_URL + '/api/paradas-comprobantes/url-temporaria',
          method: 'POST',
          data,
          auth: true
        });
        return response.data;
  
      } catch (error) {
        throw error
      }
  
    }

}