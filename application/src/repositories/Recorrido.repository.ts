import { ParadaModel } from 'src/models/Parada.model';
import { RecorridoModel, RecorridoFormModel, RecorridoResponseModel, UpdateOrigenRequest, UpdateDestinoRequest, UpdateOrigenActualRequest, OptimizarRecorridoRequestModel} from 'src/models/Recorrido.model';
import request from 'src/utils/ApiResponseCapacitor.util';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class RecorridoRepository {

  
  async obtenerRecorrido(data: any): Promise<RecorridoModel | any> {
    try {
        return await request({
            url: API_BASE_URL + '/api/armar-recorrido',
            method: 'POST',
            data,
            auth: true
          });
    } catch (error) {
        throw error
    }
  }

  async optimizar(data: OptimizarRecorridoRequestModel) 
  : Promise<{ 
    recorrido: ParadaModel[],
    duracion: string,
    distancia: string
  }> 
  {
    try {
      const response = await request({
          url: API_BASE_URL + '/api/recorridos/optimizar',
          method: 'POST',
          data,
          auth: true
        });
      return response.data;
  } catch (error) {
      throw error
  }
  }

  async create(data : RecorridoFormModel): Promise<RecorridoResponseModel>{

    try {
      const response = await request({
        url: API_BASE_URL + '/api/recorridos',
        method: 'POST',
        data,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }

  async get(recorridoId : number | string, incluir: any): Promise<RecorridoModel[]> {
    try {
      const response = await request({
        url: API_BASE_URL + `/api/recorridos/${recorridoId}`,
        method: 'GET',
        auth: true,
        params: incluir 
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async updateOrigen(data : UpdateOrigenRequest, recorridoId : number){
    try {
      const response = await request({
        url: API_BASE_URL +  `/api/recorridos/origen/${recorridoId}`,
        method: 'PATCH',
        data,
        auth: true
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async updateOrigenActual(data : UpdateOrigenActualRequest, recorridoId : number){
    try {
      const response = await request({
        url: API_BASE_URL +  `/api/recorridos/origen-actual/${recorridoId}`,
        method: 'PATCH',
        data,
        auth: true
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async updateDestino(data : UpdateDestinoRequest, recorridoId : number){
    try {
      const response = await request({
        url:  API_BASE_URL + `/api/recorridos/destino/${recorridoId}`,
        method: 'PATCH',
        data,
        auth: true
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async removerOrigen(recorridoId : number){
    try {
      const response = await request({
        url: API_BASE_URL + `/api/recorridos/origen-remover/${recorridoId}`,
        method: 'PATCH',
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async removerDestino(recorridoId : number){
    try {

      const response = await request({
        url: API_BASE_URL + `/api/recorridos/destino-remover/${recorridoId}`,
        method: 'PATCH',
        auth: true
      });

      return response.data;

    } catch (error) {
      throw error
    }
  }

}