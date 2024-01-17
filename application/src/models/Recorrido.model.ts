

export interface RecorridoModel {
    id: number;
    rider_id: number;
    creador_por: number;
    estado_recorrido_id: number;
    origen_lat: number | null;
    origen_lng: number | null;
    destino_lat: number | null;
    destino_lng: number | null;
    origen_formateado: string | null;
    destino_formateado: string | null;
    optimizado: number;
    empresa_id: string | null;
    inicio: string;
    finalizado: string | null;
    created_at: string;
    updated_at: string;
    paradas: any[]; // Ajusta el tipo según la estructura real de las paradas
  }

export interface RecorridoFormModel {
    rider_id: number;
    inicio: string
}

export interface RecorridoResponseModel {
    recorrido : {
        id: number;
        estado_recorrido_id: number;
        inicio: string;
        rider_id: number;
        created_at: string;
        updated_at: string
    }
}

export interface UpdateOrigenRequest {
    origen_lat : number,
    origen_lng: number,
    origen_formateado: string
}

export interface CoordenadasModel{
    lat?: number,
    lng?: number,
    auto?: boolean
}