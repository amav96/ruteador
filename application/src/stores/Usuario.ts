import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences';
import AutenticacionRepository from 'src/repositories/Autenticacion.repository';
import { UsuarioModel } from 'src/models/Usuario.model';


interface UsuarioStoreModel{
    usuario : UsuarioModel,
    token : string
}

let _TOKEN = "_token"

const autenticacionRepository = new AutenticacionRepository();

export const useUsuarioStore = defineStore('usuario', {
    state: () =>
    ({
      usuario: null as unknown as UsuarioModel,
      token: ""
    } as UsuarioStoreModel),

  actions: {
    setUsuario(usuario : UsuarioModel){
      this.usuario = usuario
    },
    async usuarioAutenticado(): Promise<boolean> {
      if(!this.usuario || !this.token){
        let tokenAutenticado = await Preferences.get({ key: _TOKEN });
        if(!tokenAutenticado.value){
          return false
        } 
        return true
      } else {
        return true
      }
    },
    async getUsuario(){
      if(!this.usuario){
        try {
          const response = await autenticacionRepository.autenticado()
          this.setUsuario(response.autenticado)
          this.getToken()
          return this.usuario
          // const token = await Preferences.get({ key: _RECORRIDO });
        } catch (error) {
            console.log(error)
        }
      } else {
        return this.usuario
      }

    },
    setToken(token : string){
        this.token = token
        Preferences.set({ key: _TOKEN, value: token });
    },
    async getToken(){
      if(!this.token){
        let tokenAutenticado = await Preferences.get({ key: _TOKEN });
        if(tokenAutenticado.value){
          this.setToken(tokenAutenticado.value);
        } else {
          console.error("Empty token");
        }
      }
    },
    async logout(){
      this.token = ''
      // @ts-ignore
      this.usuario = null
      await Preferences.remove({ key: _TOKEN });
    }
  },
})