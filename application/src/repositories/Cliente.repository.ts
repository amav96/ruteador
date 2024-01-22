import { ClienteModel, ClienteRequestModel } from 'src/models/Cliente.model';
import request from 'src/utils/ApiResponseCapacitor.util';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class ClienteRepository {

  async get(cliente_id: number | string, params: any = {}): Promise<ClienteModel[]>{

    try {
      const response = await request({
        url: API_BASE_URL + '/api/clientes/' + cliente_id,
        method: 'GET',
        auth: true,
        params
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }

  async create(data : ClienteRequestModel): Promise<ClienteModel>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/clientes',
        method: 'POST',
        data,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async update(data: ClienteRequestModel, cliente_id: string | number) : Promise<ClienteModel>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/clientes/' + cliente_id,
        method: 'PUT',
        data,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

}