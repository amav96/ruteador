
import { UsuarioEmpresaModel } from 'src/models/UsuarioEmpresa.model';
import request from 'src/utils/ApiResponse.helper';

import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class UsuarioEmpresaRepository {

  async get(params?:any): Promise<UsuarioEmpresaModel[]>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/usuarios-empresas',
        method: 'GET',
        auth: true,
        params
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async terminarRelacion(usuarioEmpresaId: number): Promise<UsuarioEmpresaModel> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/usuarios-empresas/${usuarioEmpresaId}/terminar-relacion`,
        method: 'GET',
        auth: true,
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }
   
}