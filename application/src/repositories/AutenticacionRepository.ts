import request from 'src/utils/ApiResponse.helper';
import { LoginModel } from 'src/models/Autenticacion.model'
import { UsuarioModel } from 'src/models/Usuario.model';


export default class AutenticacionRepository {

    async login(form: LoginModel): Promise<any> {
        try {
            return await request({
                url: '/api/auth/login',
                method: 'POST',
                data: form
              });
        } catch (error: any) {
            throw error
        }
    
    }

    async autenticado(): Promise<{autenticado: UsuarioModel}> {
        try {
            const response =  await request({
                url: '/api/auth/autenticado',
                method: 'GET',
              });
              
            return response.data;

        } catch (error: any) {
            throw error
        }
    }

}