import { EmpresaModel } from "./Empresa.model";
import { RolModel } from "./Rol.model";
import { UsuarioModel } from "./Usuario.model";

export interface GetInvitacionEmpresaRequest {
    email_invitado?: string;
    invitador_id?: number
    incluir?: string[],
    empresa_id?: number
}

export interface InvitacionEmpresaModel {
    id: number;
    email_invitado: string;
    invitador_id: number;
    empresa_id: number;
    invitacion_estado_id: number;
    rol_id: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    rol: RolModel;
    empresa: EmpresaModel;
    invitador: UsuarioModel
    estado: InvitacionEstadoModel
    invitado?: UsuarioModel
}

export interface InvitacionEmpresaCreateRequestModel {
    email_invitado: string;
    empresa_id: number;
    rol_id: number;
    invitador_id: number;
}

export interface InvitacionEstadoModel {
    id: number;
    nombre: string;
    codigo: string;
    color: string;
}


