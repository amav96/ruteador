import { UsuarioPaginacionModel } from 'src/models/Usuario.model';
import request from 'src/utils/ApiResponse.helper';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class UsuarioRepository {

  async get(params?: any): Promise<UsuarioPaginacionModel> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/usuarios`,
        method: 'GET',
        auth: true,
        params: params 
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }
  // async marcarActualizado

}