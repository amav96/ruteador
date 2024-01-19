export interface ParadaRequestModel {
    recorrido_id?: number;
    lat: number;
    lng: number;
    direccion_formateada: string;
    codigo_postal: string;
    localidad: string;
    provincia: string;
    rider_id: number
}

export interface EstadoParadaModel {
    codigo: string;
    id: number;
    nombre: string;
    estado_parada_id: number;
}

export interface ParadaModel {
    codigo_postal: string;
    created_at: string;
    direccion_formateada: string;
    estado_parada: EstadoParadaModel;
    id: number;
    lat: number;
    lng: number;
    localidad: string;
    provincia: string;
    recorrido_id: number;
    rider_id: number;
    updated_at: string;
}