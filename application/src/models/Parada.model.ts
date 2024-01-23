import { ItemModel } from "./Item.model";

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

export interface ParadaEstadoRequestModel {
    parada_estado_id: number
    rider_id: number
}

export interface ParadaEstadoModel {
    codigo: string;
    color: string;
    id: number;
    nombre: string;
    tipo: string;
}

export interface ParadaModel {
    codigo_postal: string;
    created_at: string;
    direccion_formateada: string;
    parada_estado_id: number;
    parada_estado: ParadaEstadoModel;
    id: number;
    lat: string;
    lng: string;
    localidad: string;
    provincia: string;
    recorrido_id: number;
    rider_id: number;
    updated_at: string;
    items: ItemModel[] 
}


