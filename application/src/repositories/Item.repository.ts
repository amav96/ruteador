import { InformeExcelResponse, InformeItemRequest, InformeResponse, ItemEstadoRequestModel, ItemModel, ItemRequestModel, UrlTemporariaItemComprobanteRequestModel, UrlTemporariaItemComprobanteResponseModel } from 'src/models/Item.model';
import request from 'src/utils/ApiResponse.helper';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class ItemRepository {

  async get(item_id?: number | string, form?: any): Promise<ItemModel[]>{
    let url = item_id ? `/${item_id}` : ''
   
    try {
      const response = await request({
        url: API_BASE_URL + '/api/items' + url,
        method: 'GET',
        auth: true,
        params: form
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }

  async getUltimoItem(params: any): Promise<ItemModel>{
    
    try {
      const response = await request({
        url: API_BASE_URL + `/api/items/ultimo/item`,
        method: 'GET',
        auth: true,
        params
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }

  async create(data : ItemRequestModel): Promise<any>{

    try {
      const response = await request({
        url: API_BASE_URL + '/api/items',
        method: 'POST',
        data,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
    
  }

  async update(data: ItemRequestModel, item_id: string | number) : Promise<ItemModel>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/items/' + item_id,
        method: 'PUT',
        data,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async updateEstado(data: ItemEstadoRequestModel, item_id: string | number): Promise<ItemModel>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/items/estado/' + item_id,
        method: 'POST',
        data: {...data, ...{_method: 'PATCH'}} ,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async eliminarItemComprobante(item_comprobante_id: number){
    try {
      const response = await request({
        url: API_BASE_URL + '/api/items-comprobantes/delete/' + item_comprobante_id,
        method: 'DELETE',
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async generarUrlTemporariaComprobante(data: UrlTemporariaItemComprobanteRequestModel)
  :Promise< UrlTemporariaItemComprobanteResponseModel> {

    try {
      const response = await request({
        url: API_BASE_URL + '/api/items-comprobantes/url-temporaria',
        method: 'POST',
        data,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }

  }

  async getInformeItems(form: InformeItemRequest): Promise<InformeResponse>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/informes-items/gestion',
        method: 'POST',
        data: form,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  async getInformeItemsExcel(form: InformeItemRequest): Promise<InformeExcelResponse>{
    try {
      const response = await request({
        url: API_BASE_URL + '/api/informes-items/gestion/excel',
        method: 'POST',
        data: form,
        auth: true
      });
      return response.data;

    } catch (error) {
      throw error
    }
  }

  

}