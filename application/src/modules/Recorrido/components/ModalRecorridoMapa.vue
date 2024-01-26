<template>
    <q-dialog 
        v-model="openModal" 
        persistent
        :maximized="true"
        >
        <q-card>
            <div class="full-width q-pa-sm">
                <q-icon 
                @click="emit('close')" 
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
import { reactive } from 'vue';
import { toRefs } from 'vue';
import { ref, watch } from 'vue';
const { google } : any = window;

export interface Props {
    open: boolean;
    lat: number;
    lng: number;
    polyline: string | null;
    paradas: ParadaModel[]
}
const props = withDefaults(defineProps<Props>(), {
});

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { open, lat, lng, paradas, polyline } = toRefs(props)

watch(open, (newVal) => {
    openModal.value = newVal
    if(newVal && lat?.value && lng?.value){
        let coords = {lat: lat.value, lng: lng.value}
        setTimeout(() => {
            initMap(coords)
        }, 1000);
    }
})  

const openModal = ref<boolean>(false)

const bounds = ref<any>()
const googleMaps = reactive<any>({
    map: '',
    markerMain: '',
    markers: []
})

const initMap = (coords: { lat: number, lng: number}) => {
    const { lat, lng } = coords;
    bounds.value = new google.maps.LatLngBounds();
    const myPosition = { lat, lng };
    googleMaps.map = new google.maps.Map(document.getElementById('map'), {
        center: myPosition,
        zoom: 14,
    });


    googleMaps.markerMain = new google.maps.Marker({
        position: myPosition,
        map: googleMaps.map,
        icon: `https://api.devuelvoya.com/images/icons/car.png`,
    });

    createLocationsMarkers()
    console.log(polyline.value)
    // Decodificar la cadena de la polilínea para obtener las coordenadas
    const path = google.maps.geometry.encoding.decodePath(polyline?.value || '');

    // Crear la polilínea
    googleMaps.routePolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMaps.map
    });

    // Mostrar la polilínea en el mapa
    googleMaps.routePolyline.setMap(googleMaps.map);

    const coord = new google.maps.LatLng(myPosition);
    bounds.value.extend(coord);
    googleMaps.map.fitBounds(bounds.value);
}

const createLocationsMarkers = () => {
    paradas.value.forEach((point) => {
        const coord = new google.maps.LatLng(point.lat, point.lng);
        bounds.value.extend(coord);
        createMarker(coord, point);
        googleMaps.map.fitBounds(bounds.value);
    });
}

const createMarker = (coord : any, point : any) => {

    let iconCustom = `https://api.devuelvoya.com/images/icons/red-marker.png`;

    const marker = new google.maps.Marker({
        position: coord,
        map: googleMaps.map,
        icon: iconCustom,
    });

    googleMaps.markers.push(marker);
}

</script>

<style scoped>

.map{
    position: fixed !important;
    height: 100% !important;
    width: 100% !important;
}


</style>