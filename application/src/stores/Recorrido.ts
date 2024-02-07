import { defineStore } from 'pinia'
import { ParadaModel } from 'src/models/Parada.model';
import { PropiedadesDetectadasModel, RecorridoModel } from 'src/models/Recorrido.model';

interface RecorridoStoreModel{
  recorrido : RecorridoModel,
  paradas: ParadaModel[],
  propiedadesDetectadas: PropiedadesDetectadasModel
}

export const useRecorridoStore = defineStore('recorrido', {
    state: () =>
    ({
      recorrido: null as unknown as RecorridoModel,
      paradas: [],
      propiedadesDetectadas : null as unknown as PropiedadesDetectadasModel,
    } as RecorridoStoreModel),

  actions: {
    
  },
})