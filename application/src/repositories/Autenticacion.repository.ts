import request from 'src/utils/ApiResponse.helper';
import { LoginModel, GoogleAuthLoginRequest, RegistrarRequestModel, GoogleAuthRegistrarRequest } from 'src/models/Autenticacion.model'
import { UsuarioModel } from 'src/models/Usuario.model';
import { API_BASE_URL } from 'src/utils/BaseUrl'

interface LoginResponse {
    usuario: UsuarioModel;
    token: string;
}

export default class AutenticacionRepository {

    async login(form: LoginModel): Promise<LoginResponse> {
        try {
            const response = await request({
                url: API_BASE_URL +'/api/auth/login',
                method: 'POST',
                data: form,
                
              });
            return response.data;
        } catch (error: any) {
            throw error
        }
    
    }

    async registrar(form: RegistrarRequestModel): Promise<LoginResponse> {
        try {
            const response = await request({
                url: API_BASE_URL +'/api/auth/registrar',
                method: 'POST',
                data: form,
                
              });
            return response.data;
        } catch (error: any) {
            throw error
        }
    
    }

    async googleAuthLogin(form: GoogleAuthLoginRequest): Promise<LoginResponse> {
        try {
            const response = await request({
                url: API_BASE_URL +'/api/oauth/google-auth/login',
                method: 'POST',
                data: form,
              });
            return response.data;
        } catch (error: any) {
            throw error
        }
    
    }

    async googleAuthRegistrar(form: GoogleAuthRegistrarRequest): Promise<LoginResponse> {
        try {
            const response = await request({
                url: API_BASE_URL +'/api/oauth/google-auth/registrar',
                method: 'POST',
                data: form,
              });
            return response.data;
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
    
    async logout(): Promise<any> {
        try {
            const response =  await request({
                url: API_BASE_URL +'/api/auth/logout',
                method: 'POST',
                auth: true
              });
              
            return response.data;

        } catch (error: any) {
            throw error
        }
    }

    async usurpar(usuarioId: number) : Promise<LoginResponse> {
        try {
            const response =  await request({
                url: API_BASE_URL +'/api/auth/usurpar/' + usuarioId,
                method: 'GET',
                auth: true
              });
              
            return response.data;

        } catch (error: any) {
            throw error
        }
    }

}