import { ParadaEstadoRequestModel, ParadaModel, ParadaRequestModel } from 'src/models/Parada.model';
import request from 'src/utils/ApiResponseCapacitor.util';
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
            console.log(error)
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

}