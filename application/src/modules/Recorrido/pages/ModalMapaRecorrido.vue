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
    let domMap = document.getElementById('map')
    console.log(domMap)
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
const googleMaps = reactive<any>({
    map: '',
    markerMain: '',
    markers: []
})

const infoWindow = ref<any>(null)

const iniciarMapa = () => {
    const { origen_actual_lat, origen_actual_lng } = recorrido.value;
    bounds.value = new google.maps.LatLngBounds();
    const myPosition = { lat: origen_actual_lat, lng: origen_actual_lng };
    googleMaps.map = new google.maps.Map(document.getElementById('map'), {
        center: myPosition,
        zoom: 14,
    });

    googleMaps.markerMain = new google.maps.Marker({
        position: myPosition,
        map: googleMaps.map,
        icon: `https://api.devuelvoya.com/images/icons/yellow-marker.png`,
    });

    crearMarcadorPosiciones()
    // Decodificar la cadena de la polilínea para obtener las coordenadas
    const path = google.maps.geometry.encoding.decodePath(recorrido.value.polyline || '');

    // Crear la polilínea
    googleMaps.routePolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#145DA0',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMaps.map
    });

    // Mostrar la polilínea en el mapa
    googleMaps.routePolyline.setMap(googleMaps.map);

    const coord = new google.maps.LatLng(myPosition);
    bounds.value.extend(coord);
    googleMaps.map.fitBounds(bounds.value);
    infoWindow.value = new google.maps.InfoWindow();
}

const crearMarcadorPosiciones = () => {
    paradasVisitables.value.forEach((point) => {
        const coord = new google.maps.LatLng(point.lat, point.lng);
        bounds.value.extend(coord);
        crearMarcador(coord, point);
        googleMaps.map.fitBounds(bounds.value);
    });

    marcarFinalRecorrido()
}

const marcarFinalRecorrido = () => {
    let iconCustom = `https://api.devuelvoya.com/images/icons/yellow-marker.png`;
    const { destino_lat, destino_lng } = recorrido.value
    const coord = new google.maps.LatLng(destino_lat, destino_lng);

    const marker = new google.maps.Marker({
        position: coord,
        map: googleMaps.map,
        icon: iconCustom,
    });
    googleMaps.markers.push(marker);
}

const crearMarcador = (coord : any, point : ParadaModel) => {
    
    const html = popUp(point)
   
    let icon = point.parada_estado.codigo === 'visitado' ? 'green-marker.png' : point.parada_estado.tipo === 'negativo' ? 'red-marker.png' : 'blue-marker.png'
    let urlIcon = `https://api.devuelvoya.com/images/icons/${icon}`;

    const marker = new google.maps.Marker({
        position: coord,
        map: googleMaps.map,
        icon: urlIcon,
    });

    google.maps.event.addListener(marker, 'click', () => {
       infoWindow.value.setContent(html);
       infoWindow.value.open(googleMaps.map, marker);

      });

    googleMaps.markers.push(marker);
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