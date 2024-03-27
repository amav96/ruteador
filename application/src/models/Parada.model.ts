import { StorageAwsModel } from "./Aws.model";
import { ItemModel } from "./Item.model";

export interface ParadaRequestModel {
    recorrido_id?: number;
    lat: number;
    lng: number;
    direccion_formateada: string;
    codigo_postal: string;
    localidad: string;
    provincia: string;
    rider_id: number,
    tipo_domicilio?: string
    hora_llegada_estimada?: string
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

export interface ParadaComprobanteModel {
    id: number;
    parada_id: number;
    path: string;
    usuario_id: number;
    created_at: string;
    updated_at: string
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
    orden: number;
    hora_llegada_estimada: string;
    localidad: string;
    provincia: string;
    recorrido_id: number;
    rider_id: number;
    updated_at: string;
    items: ItemModel[],
    optimizado: number;
    comprobantes: ParadaComprobanteModel[]
}


export interface UrlTemporariaParadaComprobanteRequestModel {
    nombre_archivo: string
    parada_id: number
}

export interface ParadaComprobanteModel {
    id: number;
    parada_id: number;
    path: string;
    base64Image?: string
    usuario_id: number;
    created_at: string;
    updated_at: string
}

export interface UrlTemporariaParadaComprobanteResponseModel {
    comprobante: ParadaComprobanteModel
    storage: StorageAwsModel
}


