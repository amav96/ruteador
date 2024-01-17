import { RecorridoModel, RecorridoFormModel, RecorridoResponseModel, UpdateOrigenRequest} from 'src/models/Recorrido.model';
import request from '../utils/ApiResponse.helper';
import { Preferences } from '@capacitor/preferences';

const _RECORRIDO = '_recorrido';



export default class RecorridoRepository {
  async setRecorrido(data: any): Promise<void> {
    await Preferences.set({
      key: _RECORRIDO,
      value: JSON.stringify(data),
    });
  }

  async get(recorridoId : number | string, relaciones?: string[]): Promise<RecorridoModel[]> {
    try {
      const response = await request({
        url: `api/recorridos/${recorridoId}${relaciones ? '?relaciones=' + relaciones : ''}`,
        method: 'GET',
        auth: true
      });
 
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async updateOrigen(data : UpdateOrigenRequest, recorridoId : number){
    try {
      const response = await request({
        url: `api/recorridos/origen/${recorridoId}`,
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
        url: `api/recorridos/origen-remover/${recorridoId}`,
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
        url: `api/recorridos/destino-remover/${recorridoId}`,
        method: 'PATCH',
        auth: true
      });

      return response.data;

    } catch (error) {
      throw error
    }
  }

  async setOrigin(data: any): Promise<void> {
    // const storage_recorrido = await this.getRecorrido(1);
    // await this.setRecorrido({
    //   ...storage_recorrido,
    //   origin: data,
    // });
  }

  async removeOrigin(): Promise<void> {
    // const storage_recorrido = await this.getRecorrido(1);
    // if (storage_recorrido) {
    //     // @ts-ignore
    //   delete storage_recorrido.origin;
    //   await this.setRecorrido({
    //     ...storage_recorrido,
    //   });
    // }
  }

  async setDestination(data: any): Promise<void> {
    // const storage_recorrido = await this.getRecorrido(1);
    // await this.setRecorrido({
    //   ...storage_recorrido,
    //   destination: data,
    // });
  }

  async removeDestination(): Promise<void> {
    // const storage_recorrido = await this.getRecorrido(1);
    // if (storage_recorrido) {
    //     // @ts-ignore
    //   delete storage_recorrido.destination;
    //   await this.setRecorrido({
    //     ...storage_recorrido,
    //   });
    // }
  }

  async obtenerRecorrido(data: any): Promise<RecorridoModel | any> {
    try {
        return await request({
            url: 'api/armar-recorrido',
            method: 'POST',
            data,
            auth: true
          });
    } catch (error) {
        throw error
    }
  }

  async create(data : RecorridoFormModel): Promise<RecorridoResponseModel>{

    try {
      const response = await request({
        url: 'api/recorridos',
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