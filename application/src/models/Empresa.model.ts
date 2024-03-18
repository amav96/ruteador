export interface EmpresaModel {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
    deleted_at: string
    usuario_id: number
}


export interface EmpresaCreateRequestModel {
    nombre: string
}