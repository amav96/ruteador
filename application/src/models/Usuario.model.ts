import { EmpresaModel } from "./Empresa.model";
import { PaisModel } from "./Pais.model";


export interface UsuarioConsumoModel {
    id: number;
    cantidad_optimizar: number;
    consumo_optimizar: number;
    cantidad_detectar: number;
    consumo_detectar: number;
    cantidad_polyline: number;
    consumo_polyline: number;
    paradas_hoy: number;
    paradas_total: number;
    usuario_id: number;
    created_at: string;
    updated_at: string
}

export interface UsuarioModel {
    id: number;
    nombre: string;
    email :string;
    created_at: string;
    updated_at: string;
    empresas: EmpresaModel[];
    pais: PaisModel,
    usuarioConsumo : UsuarioConsumoModel
}

export interface UsuarioPaginacionModel {
    current_page: number;
    data: UsuarioModel[];
    per_page: number;
    total: number;
    last_page: number,
    next_page_url: string
    prev_page_url: string
}


