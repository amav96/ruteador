import { RecorridoModel } from 'src/models/recorrido';
import request from '../utils/ApiResponse.helper';
import { Preferences } from '@capacitor/preferences';

const _RECORRIDO = '_recorrido';

interface Recorrido {
  intermediates: any[];
  origin: {
    data: any
    formatted_address?: string;
  };
  destination: {
    data: any
    formatted_address?: string;
  };
}

export default class RecorridoRepository {
  async setRecorrido(data: any): Promise<void> {
    await Preferences.set({
      key: _RECORRIDO,
      value: JSON.stringify(data),
    });
  }

  async getRecorrido(): Promise<Recorrido | null> {
    const ret = await Preferences.get({ key: _RECORRIDO });

    // @ts-ignore
    const recorrido = JSON.parse(ret.value);
    
    return recorrido;
  }

  async setOrigin(data: any): Promise<void> {
    const storage_recorrido = await this.getRecorrido();
    await this.setRecorrido({
      ...storage_recorrido,
      origin: data,
    });
  }

  async removeOrigin(): Promise<void> {
    const storage_recorrido = await this.getRecorrido();
    if (storage_recorrido) {
        // @ts-ignore
      delete storage_recorrido.origin;
      await this.setRecorrido({
        ...storage_recorrido,
      });
    }
  }

  async setDestination(data: any): Promise<void> {
    const storage_recorrido = await this.getRecorrido();
    await this.setRecorrido({
      ...storage_recorrido,
      destination: data,
    });
  }

  async removeDestination(): Promise<void> {
    const storage_recorrido = await this.getRecorrido();
    if (storage_recorrido) {
        // @ts-ignore
      delete storage_recorrido.destination;
      await this.setRecorrido({
        ...storage_recorrido,
      });
    }
  }

  async obtenerRecorrido(data: any): Promise<RecorridoModel | any> {
    try {
        return await request({
            url: 'api/armar-recorrido',
            method: 'POST',
            data,
          });
    } catch (error) {
        throw error
    }

  }
}