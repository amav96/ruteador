import { UpdateUsuarioRequest, UpdateUsuarioResponse,  UsuarioModel, UsuarioPaginacionModel } from 'src/models/Usuario.model';
import request from 'src/utils/ApiResponse.helper';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class UsuarioRepository {

  async get(params?: any): Promise<UsuarioPaginacionModel | UsuarioModel> {
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

  async update(usuarioId: number , form: UpdateUsuarioRequest): Promise<UpdateUsuarioResponse> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/usuarios/${usuarioId}`,
        method: 'PATCH',
        auth: true,
        data: form 
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }
  // async marcarActualizado

}