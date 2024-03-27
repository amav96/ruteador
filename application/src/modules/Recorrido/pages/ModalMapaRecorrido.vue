<template>
    <div id="myModal" class="modal-map">
        <div class="modal-content-map">
            <div 
            class="full-width q-mb-lg q-pa-sm back-map">
                <q-btn  @click="$emit('close', true)"  round color="white" class="text-deep-purple-13" icon="arrow_back" />
            </div>
            <div id="map-recorrido" class="map-recorrido bg-white "></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ParadaModel } from 'src/models/Parada.model';
import { ref, watch, toRefs, reactive, onMounted, computed, nextTick } from 'vue';
import { useRecorridoStore } from 'src/stores/Recorrido'
import { useUsuarioStore } from 'src/stores/Usuario'
import { storeToRefs } from 'pinia';
import RecorridoRepository from 'src/repositories/Recorrido.repository';
import raceFlag from 'src/assets/checkered-flag.png'
import circulo from 'src/assets/circulo.png'
import { getHoraLlegadaEstimada } from 'src/utils/Util';

const emit = defineEmits(['close', 'goToDetalleParada']);

interface Props {
    open: boolean,
    usuarioPosicionActual: {
        coords: {
            accuracy: number;
            altitude: number | null;
            altitudeAccuracy: number | null
            heading: number | null;
            latitude: number;
            longitude: number;
            speed: number | null
        }
    } | null,
}

const props = defineProps<Props>();


const { open, usuarioPosicionActual } = toRefs(props)

const openModal = ref<boolean>(false)
watch(open, (newValue: boolean) => {
    openModal.value = newValue
})


const recorridoRepository = new RecorridoRepository();

const { google } : any = window;

const usuarioStore = useUsuarioStore()
const recorridoStore = useRecorridoStore()
const { recorrido, paradas } = storeToRefs(recorridoStore)

watch(openModal, async (modalAbierto) => {
    await nextTick();
    let domMap = document.getElementById('map-recorrido')
    if(modalAbierto && domMap && !mapaIniciado.value){
        iniciarMapa()
        asignarEventos()
    } 
})


const asignarEventos = () => {
    // @ts-ignore
    window.navegar = function (event: any) {
        navegar(event);
    };
    // @ts-ignore
    window.goToDetalleParada = function (event: any) {
        goToDetalleParada(event);
    };
}

const paradasVisitables = computed<ParadaModel[]>(() => paradas?.value)

const bounds = ref<any>()
const googleMaps = reactive<any>({
    map: '',
    markerMain: '',
    markers: [],
    zoom: null
})

interface Coordinates {
    lat: number | null;
    lng: number | null;
}

const infoWindow = ref<any>(null)

const mapaIniciado = ref<boolean>(false)
const iniciarMapa = async () => {

    mapaIniciado.value = true;
    const { origen_actual_lat, origen_actual_lng } = recorrido.value;
    bounds.value = new google.maps.LatLngBounds();
    const myPosition: Coordinates = { lat: origen_actual_lat, lng: origen_actual_lng };
    
    googleMaps.map = new google.maps.Map(document.getElementById('map-recorrido'), {
        center: myPosition,
        zoom: 14,
        styles: [
            {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
            }
        ],
        heading: 320,
        tilt: 47.5,
      
    });

    marcadorInicialRecorrido(myPosition);
   
    let path : any = '';
    
    if(recorrido.value.polyline){
        path = google.maps.geometry.encoding.decodePath(recorrido.value.polyline);
    } else {
       
        const response = await recorridoRepository.getPolyline({
            recorrido_id: recorrido.value.id,
            rider_id: usuarioStore.usuario.id
        });
        const { polyline } = response;
        if(polyline){
            recorrido.value.polyline = polyline
            path = google.maps.geometry.encoding.decodePath(polyline);
        }
    }
    // Decodificar la cadena de la polilínea para obtener las coordenadas

    crearMarcadorPosiciones()
    
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

    google.maps.event.addListener(googleMaps.map, 'zoom_changed', () => {
        googleMaps.zoom = googleMaps.map.getZoom()
    });
}

const marcadorInicialRecorrido = (myPosition: Coordinates) => {
    // var label = {
    //     text: "A",
    //     color: "white",
    //     fontSize: "13px",
    // };
    googleMaps.markerMain = new google.maps.Marker({
        position: myPosition,
        map: googleMaps.map,
        // icon: markerImage("white", "#000"),
        icon: raceIcon,
        // label: label
    });

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
    const { destino_lat, destino_lng } = recorrido.value
    const coord = new google.maps.LatLng(destino_lat, destino_lng);

    // var label = {
    //     text: "B",
    //     color: "white",
    //     fontSize: "13px",
    // };
    
    const marker = new google.maps.Marker({
        position: coord,
        map: googleMaps.map,
        // icon: markerImage("white", "#000"),
        icon: raceIcon,
        // label: label
    });

    googleMaps.markers.push(marker);
}

const raceIcon = {
    url: raceFlag,
    scaledSize: new google.maps.Size(50, 50) // Aquí puedes ajustar el tamaño deseado
};

const paradasAgregadas = ref<ParadaModel[]>([])
const crearMarcador = (coord: any,parada : ParadaModel) => {

    paradasAgregadas.value.push(parada)
    
    const html = popUpHtml(parada)
    if(parada.direccion_formateada === 'Av. Independencia 1500'){
        console.log(JSON.parse(JSON.stringify(parada)))
    }
   
    let iconColor = parada.parada_estado.codigo === 'visitado' 
                ? '#0BDA51' 
                : parada.parada_estado.tipo === 'negativo' 
                    ? '#C70039' 
                    : '#651fff'
    let text = parada.parada_estado.codigo === 'visitado' 
                ? ' '
                : parada.parada_estado.tipo === 'negativo' 
                    ? ' ' 
                    // #C70039
                    : parada.orden? parada.orden.toString() : ' ';
    var label = {
        text,
        color: "white",
        fontSize: "13px",
    };

    const marker = new google.maps.Marker({
        position: coord,
        map: googleMaps.map,
        icon: markerImage("white", iconColor),
        label: label
    });

    google.maps.event.addListener(marker, 'click', () => {
       infoWindow.value.setContent(html);
       infoWindow.value.open(googleMaps.map, marker);

      });

    googleMaps.markers.push(marker);
    
}

const markerImage = (strokeColor: string, pinColor: string, labelOriginFilled?: any) => {
    var pinSVGFilled = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
    return {  // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
        path: pinSVGFilled,
        anchor: new google.maps.Point(12,17),
        fillOpacity: 1,
        fillColor: pinColor,
        strokeWeight: 1,
        strokeColor: strokeColor,
        scale: 2,
        labelOrigin: labelOriginFilled ?? new google.maps.Point(12,9)
    }
}

const popUpHtml = (point: ParadaModel) => {
  
    const html = `
            <div class="flex column q-mr-md q-mb-sm">
                <div class="q-mb-xs text-weight-medium text-subtitle1">
                    Calle : <span class="text-subtitle1 text-weight-medium"> ${point.direccion_formateada ?? ''} </span>
                </div>
                <div class="q-mb-xs text-weight-medium text-subtitle1" >
                    Localidad : 
                    <span class="text-subtitle1 text-weight-medium"> ${point.localidad ?? ''} </span>
                </div>
                <div class="q-mb-xs text-weight-medium text-subtitle1" >
                    Hora llegada : 
                    <span class="text-subtitle1 text-weight-medium"> ${getHoraLlegadaEstimada(point.hora_llegada_estimada)} </span>
                </div>
                <button 
                class="bg-deep-purple-13 text-white btnManag rounded-borders q-pa-xs text-weight-medium text-subtitle1" 
                id="btnNavegar" 
                parada-id="${point.id}" 
                onclick="window.navegar(event)"
                style="outline: none;border:none"
                >
                    Navegar
                </button>
                <button 
                class="bg-deep-purple-13 text-white btnManag rounded-borders q-pa-xs text-weight-medium text-subtitle1 q-mt-sm" 
                id="btnNavegar" 
                parada-id="${point.id}" 
                onclick="window.goToDetalleParada(event)"
                style="outline: none;border:none"
                >
                    Detalle parada
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

const goToDetalleParada = (event: any) => {
    const button = event.target;
    const paradaId = button.getAttribute('parada-id');
    if(!paradaId) return
    
    emit("goToDetalleParada", {id: paradaId})
}

watch(paradasVisitables, async (newParadas: ParadaModel[]) => {
    if(mapaIniciado.value){
        await nextTick();
        agregarNuevosMarcadoresMapaRenderizado(newParadas)
    }
    
}, { deep: true})

const agregarNuevosMarcadoresMapaRenderizado = (newParadas: ParadaModel[]) =>{
    try {
        const agregar = newParadas.filter((p: ParadaModel) => !paradasAgregadas.value.some((pa: ParadaModel) => pa.id === p.id))
        
        if(agregar.length > 0){
            const [nuevaParada] = agregar
            const coord = new google.maps.LatLng({lat: nuevaParada.lat, lng : nuevaParada.lng});
            crearMarcador(coord, nuevaParada)
            googleMaps.map.setZoom(googleMaps.zoom ? googleMaps.zoom : 14);
        }
    } catch (error) {
        console.log(error)
    }
}


watch(usuarioPosicionActual, (newPosition) => {
    if(newPosition && newPosition.coords){
        if(!mapaIniciado.value){
            return
        }
        const coord = new google.maps.LatLng(newPosition.coords.latitude, newPosition.coords.longitude);
        actualizarMiPosicion(coord);
    }
    
})

const miPosicionMarker = ref<google.maps.Marker | null>(null);
const actualizarMiPosicion = (coord: google.maps.LatLng) => {
    
    if (miPosicionMarker.value) {
        miPosicionMarker.value.setPosition(coord);
    } else {
        // Crea el marcador si aún no está creado
        miPosicionMarker.value = new google.maps.Marker({
            position: coord,
            map: googleMaps.map,
            icon: {
                url: circulo,
                scaledSize: new google.maps.Size(30, 30), // Ajusta el tamaño deseado del círculo
            },
        });
    }
};

defineExpose ({
    mapaIniciado
})

</script>

<style>

.map-recorrido{
    /* position: fixed !important; */
    height: 100% !important;
    width: 100% !important;
}

.map-recorrido .gmnoprint {
    visibility: hidden;
}
.map-recorrido .gm-svpc{
    visibility: hidden;
} 

.back-map{
    position: fixed;
    z-index: 1000;
   
}

.modal-map {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    }
    .modal-content-map {
        background-color: #fefefe;
        margin: auto;
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;

    }

    /* Hide scrollbar */
    .modal-content-map::-webkit-scrollbar {
        display: none;
    }

</style>