import { StorageAwsModel } from "./Aws.model";
import { ClienteModel } from "./Cliente.model";
import { EmpresaModel } from "./Empresa.model";
import { ParadaModel } from "./Parada.model";
import { ProveedorItemModel } from "./ProveedorItem.model";
import { TipoItemModel } from "./TipoItem.model";
import { UsuarioModel } from "./Usuario.model";

export interface ItemRequestModel {
    track_id: string | null;
    empresa_id: number;
    item_tipo_id: number;
    item_proveedor_id: number;
    parada_id?: number
    rider_id?: number
    destinatario?: string
    item_estado_id: number
    cliente_id?: number
}


export interface ItemModel {
    id: number;
    cliente_id: number | null;
    cliente: ClienteModel
    item_tipo_id: number;
    track_id: string;
    item_proveedor_id: number;
    item_estado_id: number;
    destinatario: string;
    entregar: string | null;
    gestionado: string | null;
    gestionado_transformado: string | null;
    created_at: string;
    created_at_transformado: string | null;
    updated_at: string;
    empresa_id: number;
    empresa: EmpresaModel;
    creado_por: number;
    item_estado: ItemEstadoModel;
    item_proveedor: ProveedorItemModel;
    item_tipo: TipoItemModel;
    parada?: ParadaModel
    comprobantes: ItemComprobanteModel[]
}

export interface ItemPaginationModel {
    data: ItemModel[],
    current_page: number;
    per_page: number;
    total: number;
    last_page: number,
    next_page_url: string
    prev_page_url: string
}


export interface ItemEstadoRequestModel {
    item_estado_id: number
    parada_id? : number
}

export interface ItemEstadoModel {
    id: number;
    nombre: string;
    codigo: string;
    color: string;
    tipo: string;
}

export interface UrlTemporariaItemComprobanteRequestModel {
    nombre_archivo: string
    item_id: number
}

export interface ItemComprobanteModel {
    id: number;
    item_id: number;
    path: string;
    usuario_id: number;
    created_at: string;
    updated_at: string
    base64Image?: string
}

export interface UrlTemporariaItemComprobanteResponseModel {
    comprobante: ItemComprobanteModel
    storage: StorageAwsModel
}

export interface InformeItemRequest {
    fecha_inicio: string;
    fecha_fin: string;
    page: number;
    incluir: string[],
    creado_por: number
}

export interface MetricasItem {
    entregados: number;
    entregados_porcentaje: number;
    no_entregados: number;
    no_entregados_porcentaje: number;
    preparados: number;
    preparados_porcentaje: number;
    retirados: number;
    retirados_porcentaje: number;
    item_cantidad: number
}

export interface InformeResponse {
    items: ItemPaginationModel,
    metricas: MetricasItem,
    parametros: any,
    usuario: UsuarioModel
}
export interface InformeExcelResponse {
    url: string,
}