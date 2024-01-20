import { EstadoItem } from "./EstadoItem.model";
import { ProveedorItem } from "./ProveedorItem.model";
import { TipoItem } from "./TipoItem.model";

export interface ItemRequestModel {
    track_id: string | null;
    empresa_id: number;
    tipo_item_id: number;
    proveedor_item_id: number;
    parada_id?: number
    rider_id?: number
    destinatario?: string
    estado_item_id?: number
    cliente_id?: number
}

export interface ItemModel {
    id: number;
    cliente_id: number | null;
    tipo_item_id: number;
    track_id: string;
    proveedor_item_id: number;
    estado_item_id: number;
    destinatario: string;
    entregar: string | null;
    entregado: string | null;
    created_at: string;
    updated_at: string;
    empresa_id: number;
    creado_por: number;
    laravel_through_key: number;
    estado_item: EstadoItem;
    cliente: any | null; // Cambia "any" por el tipo correcto si hay más información sobre el cliente
    proveedor_item: ProveedorItem;
    tipo_item: TipoItem;
}