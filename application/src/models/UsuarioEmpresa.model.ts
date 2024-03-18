import { EmpresaModel } from "./Empresa.model";
import { InvitacionEmpresaModel } from "./InvitacionEmpresa.model";
import { RolModel } from "./Rol.model";
import { UsuarioModel } from "./Usuario.model";

export interface UsuarioEmpresaModel { 
    id: number;
    usuario_id: number;
    empresa_id: number;
    rol_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    invitacion_id: number;
    rol: RolModel;
    empresa: EmpresaModel;
    usuario: UsuarioModel;
    invitacion: InvitacionEmpresaModel;
}
