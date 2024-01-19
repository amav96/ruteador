import { ParadaModel, ParadaRequestModel } from 'src/models/Parada.model';
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

}