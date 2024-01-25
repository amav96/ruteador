import request from 'src/utils/ApiResponse.helper';
import { LoginModel } from 'src/models/Autenticacion.model'
import { UsuarioModel } from 'src/models/Usuario.model';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class AutenticacionRepository {

    async login(form: LoginModel): Promise<any> {
        try {
            return await request({
                url: API_BASE_URL +'/api/auth/login',
                method: 'POST',
                data: form,
                
              });
        } catch (error: any) {
            throw error
        }
    
    }

    async autenticado(): Promise<{autenticado: UsuarioModel}> {
        try {
            const response =  await request({
                url: API_BASE_URL +'/api/auth/autenticado',
                method: 'GET',
                auth: true
              });
              
            return response.data;

        } catch (error: any) {
            throw error
        }
    }

}