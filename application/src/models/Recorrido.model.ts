

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
    origen_actual_lat: number | null;
    origen_actual_lng: number | null;
    origen_actual_formateado: string | null;
    origen_auto: number;
    optimizado: number;
    distancia: string | null;
    duracion: string | null;
    polyline: string | null;
    empresa_id: string | null;
    inicio: string;
    finalizado: string | null;
    created_at: string;
    updated_at: string;
    paradas: any[]; // Ajusta el tipo según la estructura real de las paradas
}

export interface OptimizarRecorridoRequestModel {
    recorrido_id: number;
    rider_id: number
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
    origen_formateado: string,
    origen_auto: number
}

export interface UpdateOrigenActualRequest {
    origen_actual_lat : number,
    origen_actual_lng: number,
    origen_actual_formateado: string,
}

export interface UpdateDestinoRequest {
    destino_lat : number,
    destino_lng: number,
    destino_formateado: string
}

export interface CoordenadasModel{
    lat?: number,
    lng?: number,
    auto?: boolean
}