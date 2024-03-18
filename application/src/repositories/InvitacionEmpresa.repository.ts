
import { GetInvitacionEmpresaRequest, InvitacionEmpresaCreateRequestModel, InvitacionEmpresaModel } from 'src/models/InvitacionEmpresa.model';
import request from 'src/utils/ApiResponse.helper';

import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class InvitacionEmpresaRepository {

  async get(params?: GetInvitacionEmpresaRequest): Promise<any>{

    try {
      const response = await request({
        url: API_BASE_URL + '/api/invitaciones-empresas',
        method: 'GET',
        auth: true,
        params: params as URLSearchParams 
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }

  async create(form: InvitacionEmpresaCreateRequestModel) : Promise<InvitacionEmpresaModel>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/invitaciones-empresas',
        method: 'POST',
        auth: true,
        data: form
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async eliminarEmpresa(invitacionEmpresaId: number): Promise<InvitacionEmpresaModel> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/invitaciones-empresas/eliminarInvitacion/${invitacionEmpresaId}`,
        method: 'GET',
        auth: true,
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async aceptarEmpresa(invitacionEmpresaId: number): Promise<InvitacionEmpresaModel> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/invitaciones-empresas/aceptarInvitacion/${invitacionEmpresaId}`,
        method: 'GET',
        auth: true,
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async rechazarEmpresa(invitacionEmpresaId: number): Promise<InvitacionEmpresaModel> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/invitaciones-empresas/rechazarInvitacion/${invitacionEmpresaId}`,
        method: 'GET',
        auth: true,
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }


}