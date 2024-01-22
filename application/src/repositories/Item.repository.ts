import { ItemModel, ItemRequestModel } from 'src/models/Item.model';
import request from 'src/utils/ApiResponseCapacitor.util';
import { API_BASE_URL } from 'src/utils/BaseUrl'

export default class ItemRepository {

  async get(item_id: number | string): Promise<ItemModel[]>{

    try {
      const response = await request({
        url: API_BASE_URL + '/api/items/' + item_id,
        method: 'GET',
        auth: true
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

}