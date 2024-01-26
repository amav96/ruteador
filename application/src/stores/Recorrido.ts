import { defineStore } from 'pinia'
import { ParadaModel } from 'src/models/Parada.model';
import { RecorridoModel } from 'src/models/Recorrido.model';

interface RecorridoStoreModel{
  recorrido : RecorridoModel,
  paradas: ParadaModel[]
}

export const useRecorridoStore = defineStore('recorrido', {
    state: () =>
    ({
      recorrido: null as unknown as RecorridoModel,
      paradas: []
    } as RecorridoStoreModel),

  actions: {
    
  },
})