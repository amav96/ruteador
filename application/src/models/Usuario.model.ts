import { EmpresaModel } from "./Empresa.model";

export interface UsuarioModel {
    id: number;
    nombre: string;
    email :string;
    created_at: string;
    updated_at: string;
    empresas: EmpresaModel[]
}

