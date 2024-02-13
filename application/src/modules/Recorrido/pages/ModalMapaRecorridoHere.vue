<template>
    <q-dialog 
        v-model="openModal" 
        persistent
        :maximized="true"
        >
        <q-card>
            <div 
            @click="back" 
            class="full-width q-mb-lg q-pa-sm">
                <q-icon 
                name="arrow_back" 
                color="deep-purple-13"
                size="sm"
                
                />
            </div>
            <div id="map" class="map"></div>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ParadaModel } from 'src/models/Parada.model';
import { ref, watch, toRefs, reactive, onMounted, computed, nextTick } from 'vue';
import { useRecorridoStore } from 'src/stores/Recorrido'
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import RecorridoRepository from 'src/repositories/Recorrido.repository';
import UsuarioRepository from 'src/repositories/Usuario.repository';
import { useUsuarioStore } from 'src/stores/Usuario'


const usuarioStore = useUsuarioStore()

const recorridoRepository = new RecorridoRepository();

const router = useRouter();
const route = useRoute();


const { google } : any = window;

const recorridoStore = useRecorridoStore()
const { recorrido, paradas } = storeToRefs(recorridoStore)

watch(paradas, (value) => {
    let domMap = document.getElementById('map')
    if(domMap && value && value.length > 0){
        iniciarMapa()
        asignarEventos()
    }
})

onMounted(async () => {
 
    await nextTick(); // Asegura que el DOM se ha actualizado
   
    if(recorrido.value){
        iniciarMapa();
        asignarEventos()
    }
});

const asignarEventos = () => {
    // @ts-ignore
    window.navegar = function (event: any) {
        navegar(event);
    };
}

const paradasVisitables = computed<ParadaModel[]>(() => paradas?.value)

const openModal = ref<boolean>(true)

const bounds = ref<any>()
const hereMaps = reactive<any>({
    map: '',
    ui: '',
    markers: [],
    polyline: null
})

const infoWindow = ref<any>(null)

const iniciarMapa = async () => {

    const platform = new H.service.Platform({
        'apikey': 'TOnNjKWqJj6OGDQwp5o9c3qVlLV27GJ8D7ACh8o1OiA'
    });

    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(document.getElementById('map'),
        defaultLayers.vector.normal.map,{
        center: {lat: recorrido.value.origen_actual_lat, lng:recorrido.value.origen_actual_lng},
        zoom: 12,
        pixelRatio: window.devicePixelRatio || 1
    });

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    window.addEventListener('resize', () => map.getViewPort().resize());

    hereMaps.map = map;
    hereMaps.ui = ui;

    crearMarcadorPosiciones(map);
}

const crearMarcadorPosiciones = async (map: any) => {
    paradasVisitables.value.forEach((point) => {
        const coord = { lat: point.lat, lng: point.lng };
        crearMarcador(map, coord, point);
    });

    marcarFinalRecorrido(map);

    const response = await recorridoRepository.getPolyline({
            recorrido_id: recorrido.value.id,
            rider_id: usuarioStore.usuario.id
        });
        const { polyline } = response;
        if(polyline){
            recorrido.value.polyline = polyline
           
            const lineString = H.geo.LineString.fromFlexiblePolyline(polyline);
            const polylineObj = new H.map.Polyline(lineString, { style: { lineWidth: 4 }});
            map.addObject(polylineObj);
            // const polylineObj = new H.map.Polyline(strip, { style: { lineWidth: 4 }});
            
            // path = google.maps.geometry.encoding.decodePath(polyline);
        }

}

const marcarFinalRecorrido = (map: any) => {
    const { destino_lat, destino_lng } = recorrido.value
    const coord = { lat: destino_lat, lng: destino_lng };

    const marker = new H.map.Marker(coord);
    map.addObject(marker);
}

const crearMarcador = (map: any ,coord : any, point : ParadaModel) => {
    
    
    const marker = new H.map.Marker(coord);
    map.addObject(marker);

    // marker.addEventListener('tap', () => {
    //     const html = popUp(point);
    //     const infoBubble = new H.ui.InfoBubble(coord, {
    //         content: html
    //     });
    //     ui.addBubble(infoBubble);
    // });
}

const popUp = (point: ParadaModel) => {
    const html = `
            <div class="flex column q-mr-md q-mb-sm">
                <div class="q-mb-xs text-weight-medium text-subtitle1">
                    Calle : <span class="text-subtitle1 text-weight-medium"> ${point.direccion_formateada ?? ''} </span>
                </div>
                <div class="q-mb-xs text-weight-medium text-subtitle1" >
                    Localidad : 
                    <span class="text-subtitle1 text-weight-medium"> ${point.localidad ?? ''} </span>
                </div>
                <button 
                class="bg-blue text-white btnManag rounded-borders q-pa-xs text-weight-medium text-subtitle1" 
                id="btnNavegar" 
                parada-id="${point.id}" 
                onclick="window.navegar(event)"
                style="outline: none;border:none"
                >
                    Navegar
                </button>
              </div>
            `;
    return html;
}

const navegar = (event: any) => {
    const button = event.target;
    const paradaId = button.getAttribute('parada-id');
    if(!paradaId) return
    
    let indexParada = paradas.value.findIndex((parada: ParadaModel) => parada.id == paradaId) 
    const { lat, lng } = paradas.value[indexParada]
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url);
}

const back = () => {
    router.push({name: 'recorrido', params:{ recorrido_id: route.params.recorrido_id}})
}

</script>

<style scoped>

.map{
    position: fixed !important;
    height: 80% !important;
    width: 100% !important;
}

</style>