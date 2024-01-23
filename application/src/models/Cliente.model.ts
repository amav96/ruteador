export interface ClienteModel {
    id?: number;
    nombre: string | null;
    tipo_documento_id: number;
    tipo_documento?: {
        id: number;
        nombre: string
    }
    numero_documento: string | null;
    empresa_id?: number;
    creado_por?: number;
    created_at?: string;
    updated_at?: string;
    clientes_numeros?: { 
        id: number,
        codigo_area_id: number
        numero: string 
    }[]
};


export interface ClienteRequestModel extends Omit<
ClienteModel, 'id' | 'creado_por' | 'created_at' | 'updated_at'> {
}