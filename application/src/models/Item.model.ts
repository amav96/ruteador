import { ClienteModel } from "./Cliente.model";
import { EmpresaModel } from "./Empresa.model";
import { EstadoItemModel } from "./EstadoItem.model";
import { ProveedorItemModel } from "./ProveedorItem.model";
import { TipoItemModel } from "./TipoItem.model";

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
    entregado: string | null;
    created_at: string;
    updated_at: string;
    empresa_id: number;
    empresa: EmpresaModel;
    creado_por: number;
    item_estado: EstadoItemModel;
    
    item_proveedor: ProveedorItemModel;
    item_tipo: TipoItemModel;
}