export default class RecorridoRepository {

    set(data: any){
        localStorage.setItem('_recorrido', JSON.stringify(data))
    } 

    findAll(){
        const recorrido = localStorage.getItem('_recorrido')
        if(recorrido){
            return JSON.parse(recorrido);
        }

        return recorrido
    }
}