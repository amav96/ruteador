export interface ContactoRequestModel {
    tipo_documento_id: number
    numero_documento: string | null
    codigo_area_id: number
    nombre: string | null
    numero_celular: string | null 
    numero_fijo: string | null 
    empresa_id?: number | null,
}