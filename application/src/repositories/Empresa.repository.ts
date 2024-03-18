import { EmpresaCreateRequestModel, EmpresaModel } from 'src/models/Empresa.model';
import request from 'src/utils/ApiResponse.helper';

import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class EmpresaRepository {

  async get(params?:any): Promise<any>{

    try {
      const response = await request({
        url: API_BASE_URL + '/api/empresas',
        method: 'GET',
        auth: true,
        params
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }
   
  async create(form: EmpresaCreateRequestModel) : Promise<EmpresaModel>{
    try {
        const response = await request({
          url: API_BASE_URL + '/api/empresas',
          method: 'POST',
          auth: true,
          data: form
        });
        return response.data;
  
      } catch (error) {
        throw error
      }
  }
  


}