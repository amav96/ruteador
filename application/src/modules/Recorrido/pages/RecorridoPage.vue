<template>
    <q-page class="bg-grey-2 q-px-md">
        <div class="rounded-borders bg-white ">
          <!-- origen -->
          <q-input
            label="Ubicación de partida"
            borderless
            class="text-body1"
            color="deep-purple-13"
            v-model="origen.formatted_address"
            @click="goToSeleccionarOrigen"
          >
            <template v-slot:prepend>
              <q-icon
                :class="`q-ml-sm ${autoOrigen ? 'text-blue' : ''}`"
                :name="autoOrigen ? 'gps_fixed' : 'explore'"
              />
            </template>
            <template v-if="origen.formatted_address" v-slot:append>
              <q-icon
                name="close"
                size="xs"
                color="deep-purple-13"
                :class="`q-mr-sm ${autoOrigen ? 'pointeer' : ''}`"
                @click="removerOrigin"
              />
            </template>
          </q-input>
          <!-- destino -->
          <q-input
            :label="!destino ? 'Elige donde quieres terminar' : 'Destino'"
            borderless
            class="text-body1"
            color="deep-purple-13"
            v-model="destino.formatted_address"
            @click="goToSeleccionarDestino"
          >
            <template v-slot:prepend>
              <q-icon
                :class="`q-ml-sm`"
                name="place"
              />
            </template>
            <template v-if="destino.formatted_address" v-slot:append>
              <q-icon
                name="close"
                size="xs"
                color="deep-purple-13"
                :class="`q-mr-sm ${destino ? 'pointeer' : ''}`"
                @click="removerDestino"
              />
            </template>
          </q-input>
        </div>
        
        <!-- agregar parada -->
        <div class="flex row items-center justify-center q-my-md">
          <div class="flex column items-center">
            <q-btn @click="goToSeleccionarParada" round color="deep-purple-13" icon="add" />
            <div @click="goToSeleccionarParada" class="pointer q-mt-sm">
              <strong>Parada</strong>
            </div>
          </div>
        </div>
        
        
        <!-- lista de paradas -->
        <template v-if="tieneParadas">
          <q-scroll-area style="height: 55vh" >
            <div 
            v-for="(parada, index) in paradas" 
            :key="index"
            @click="goToActualizarParada(parada, parada.id)"
            >
              <q-item clickable v-ripple :class="[
                'list-group-item rounded-borders q-my-sm', 
                `bg-white`
                ]">
                <q-item-section >
                  <div class="flex row no-wrap items-center ">
                    <div class="q-mr-xs text-weight-bold number-container">
                      {{ index + 1 }} -
                    </div>                 

                    <div class="flex column text-body1" style="max-width: 85%;">
                      <span>{{ parada.direccion_formateada }}</span>
                      <span v-if="parada.localidad" class="text-weight-bold" > {{ parada.localidad }} </span>
                    </div>
                  </div>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon 
                  size="sm" 
                  @click.stop="!visitado(parada) ? removeAddres(index): ''" 
                  :name="visitado(parada) ? 'check_circle_outline' : 'highlight_off'" 
                  :color="visitado(parada) ? 'green-14' : 'deep-purple-13'" />
                </q-item-section>
              </q-item>
              
            </div>
          </q-scroll-area>
        </template>
  
        <router-view
          @selected-address="paradaSeleccionada"
          @select-origin="origenSeleccionado"
          @select-destination="destinoSeleccionado"
          @actualizar-estado-parada="actualizarEstadoParada"
        ></router-view>

    </q-page>
</template>
  
  <script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import RecorridoRepository from 'src/repositories/Recorrido.repository';
  import ParadaRepository from 'src/repositories/Parada.repository';
  import { computed, watch, onMounted, ref } from 'vue';
  import { Geolocation } from '@capacitor/geolocation';
  import { onBeforeUnmount } from 'vue';
  import { useQuasar } from 'quasar';
  import { RecorridoModel } from 'src/models/Recorrido.model';
  import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
  import { CoordenadasModel, UpdateOrigenRequest } from 'src/models/Recorrido.model';
  import { ParadaModel } from 'src/models/Parada.model';
  
  import { geoposicionar, formatearGeposiciones, formatearGoogleAddress } from 'src/utils/Google';
  import { useUsuarioStore } from 'src/stores/Usuario'
  import { FormateadorGoogleAddressModel } from 'src/models/Google.model';
  
  const $q = useQuasar();
  
  const recorridoRepository = new RecorridoRepository();
  const paradaRepository = new ParadaRepository();
  
  interface Way {
    formatted_address?: string ;
    data: CoordenadasModel;
  }
  
  const origen = ref<Way>({
    formatted_address: '',
    data: {},
  });
  const autoOrigen = computed(() => origen.value.data.auto || origen.value.formatted_address === 'Tu ubicación')

  const destino = ref<Way>({
    formatted_address: '',
    data: {},
  });

  const paradas = ref<ParadaModel[]>([])
  
  const router = useRouter();
  const route = useRoute();

  const usuarioStore = useUsuarioStore()
  const {
      usuario
  } = usuarioStore
  
  const recorridoId = computed(() => route.params.recorrido_id)
  
  const goToSeleccionarParada = (event: any) => {
    router.push({ name: 'buscar-direccion' });
  };
  
  const intermediates = ref<any[]>([]);
  
  const direccionLegible = ( data: FormateadorGoogleAddressModel, direccionAuxiliar : string) : string => {

    if(data.calle && data.numero){
      return `${data.calle} ${data.numero}`
    }
    return `${direccionAuxiliar}`
  }

  const paradaSeleccionada = async (data: GooglePlacesAutocompleteResponseModel) => {
    if(data.id){
      actualizarParada(data)
    } else {
      agregarParada(data)
    }
    
  };
  
  const agregarParada = async (data: GooglePlacesAutocompleteResponseModel) => {
    const { geometry: { location : { lat , lng} } , formatted_address } = data;
    const resultadoFormateo = formatearGoogleAddress(data.address_components) 
    const {
      localidad,
      provincia,
      codigo_postal,
      numero,
      calle
    } = resultadoFormateo

    try {

      if(usuario){
      const response = await paradaRepository.create({
        recorrido_id: Number(recorridoId.value),
        lat: lat(),
        lng: lng(),
        direccion_formateada: direccionLegible(resultadoFormateo, formatted_address),
        rider_id: usuario.id,
        codigo_postal: codigo_postal ?? '',
        localidad: localidad ?? '',
        provincia: provincia ?? '',
      });
      const { parada } = response;

      if(parada){
        paradas.value.push(parada)
      }
    }
      
    } catch (error) {
        console.log(error)
    }

  };
  
  const actualizarParada = async (data: GooglePlacesAutocompleteResponseModel) => {
    const { geometry: { location : { lat , lng} } , formatted_address, id } = data;
    const resultadoFormateo = formatearGoogleAddress(data.address_components) 
    const {
      localidad,
      provincia,
      codigo_postal,
    } = resultadoFormateo

    try {

      if(usuario && id){
      const response = await paradaRepository.update({
        recorrido_id: Number(recorridoId.value),
        lat: lat(),
        lng: lng(),
        direccion_formateada: direccionLegible(resultadoFormateo, formatted_address),
        rider_id: usuario.id,
        codigo_postal: codigo_postal ?? '',
        localidad: localidad ?? '',
        provincia: provincia ?? '',
      },
      id
      );

      const { parada } = response;
      const indexParada = paradas.value.findIndex((p) => p.id === Number(id))
      if(indexParada > -1){
        paradas.value[indexParada] = parada
      }
    }
      
    } catch (error) {
        console.log(error)
    }
  };
  
  const goToActualizarParada = (data: any, id: number) => {
    router.push({
      name: 'parada',
      params: { parada_id: id },
    });

  };

  const actualizarEstadoParada = (parada: ParadaModel) => {
    let indexParada = paradas.value.findIndex((p:ParadaModel) => p.id === parada.id)
    if(indexParada > -1){
      paradas.value[indexParada] = parada
    }
  }
  
  const removeAddres = async (index: number) => {
    console.log('removiendo')
    // intermediates.value.splice(index, 1);
  };
  
  onMounted(() => getRecorrido());
  
  const getRecorrido = async () => {
    const {
      recorrido_id
    } = route.params
    const params = {
      incluir : ['paradas.paradaEstado']
    }
    try {

      const response = await recorridoRepository.get(Number(recorrido_id), params);
      if (response && response.length > 0) {
        const [recorrido] = response;
        const {
          origen_lat,
          origen_lng,
          origen_formateado,
          destino_lat,
          destino_lng,
          destino_formateado,
          paradas : paradasServer
        } = recorrido

        if(origen_lat){
          origen.value.data.lat = origen_lat
        }
        if(origen_lng){
          origen.value.data.lng = origen_lng
        }
        if(origen_formateado){
          origen.value.formatted_address = origen_formateado
        }

        if(destino_lat){
          destino.value.data.lat = destino_lat
        }
        if(destino_lng){
          destino.value.data.lng = destino_lng
        }
        if(destino_formateado){
          destino.value.formatted_address = destino_formateado
        }
        if(paradasServer && paradasServer.length > 0){
          paradas.value = paradasServer
        }
        
      }
      
    } catch (error) {
      
    }
  };
  
  const tieneParadas = computed(
    () => paradas.value && paradas.value?.length > 0
  );
  const cargandoRecorrido = ref<boolean>(false);
  const obtenerRecorrido = async () => {
    if (cargandoRecorrido.value) return;
    cargandoRecorrido.value = true;
  
    if (!origen.value.formatted_address || !destino.value.formatted_address) {
      $q.notify({
        type: 'warning',
        message: 'Debes ingresar punto de partida y donde quieres terminar',
      });
      return;
    }

    const latLngOrigin = origen.value.data.location.latLng;
    if (!latLngOrigin.latitude || !latLngOrigin.longitude) {
      $q.notify({
        type: 'warning',
        message: 'No hemos podido determinar tu ubicación',
      });
      return;
    }
  
    const latLngDestination = destino.value.data.location.latLng;
    if (!latLngDestination.latitude || !latLngDestination.longitude) {
      $q.notify({
        type: 'warning',
        message: 'No hemos podido determinar tu destino',
      });
      return;
    }
  
    const request = {
      origin: {
        location: origin.value.data.location,
      },
      destination: {
        location: destino.value.data.location,
      },
      intermediates: intermediates.value,
    };
   

    try {
      $q.loading.show();
      const response = await recorridoRepository.obtenerRecorrido(request);
      const { data: { recorrido } } = response;
      reordenarRecorrido(recorrido);
    } catch (error) {
        
    } finally {
      cargandoRecorrido.value = false;
      $q.loading.hide();
    }
  };
  
  const reordenarRecorrido = (recorrido: RecorridoModel) => {
    // let orden = recorrido.routes[0].optimizedIntermediateWaypointIndex;
    // const reordenar = orden.map((posicion) => intermediates.value[posicion]);
    // intermediates.value = reordenar;
  };
  
  const verRecorridoGoogleMaps = () => {
    const waypoints = intermediates.value.map(
      (waypoint) => `${waypoint.location.lat},${waypoint.location.lng}`
    );
 
    const originPath = `${origen.value.data.lat},${origen.value.data.lng}`;
    const destinationPath = `${destino.value.data.lat},${destino.value.data.lng}`;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${originPath}&destination=${destinationPath}&travelmode=driving&waypoints=${waypoints.join(
      '|'
    )}`;
  
    window.open(url);
  };
  
  const goToSeleccionarOrigen = () => {
    router.push({ name: 'buscar-direccion', query: { origin: 1 } });
  };

  const goToSeleccionarDestino = () => {
    router.push({ name: 'buscar-direccion', query: { destination: 1 } });
  };
  
  const origenSeleccionado = async (value : GooglePlacesAutocompleteResponseModel | AutoGpsModel) => {
    
    if ('formatted_address' in value) {
      const {formatted_address, geometry } = value;
      origen.value.formatted_address = formatted_address;
      origen.value.data = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      }

    } else if('auto' in value){
      origen.value.formatted_address = 'Tu ubicación'
      if(position.value.coords){
        const { latitude , longitude } = position.value.coords
        const geo = await geoposicionar(latitude, longitude)
        geo.results = geo.results.filter((g: any) => g.types.includes('street_address'))
        const geoFormateado = formatearGeposiciones(geo);
        origen.value.data = {
          lat: geoFormateado.lat,
          lng: geoFormateado.lng,
        }
      }

    }
  
    try {

      await recorridoRepository.updateOrigen(
      {
        origen_lat: origen.value.data.lat ?? 0,
        origen_lng: origen.value.data.lng ?? 0,
        origen_formateado: origen.value.formatted_address ?? ''
      }, 
      Number(recorridoId.value));
      
    } catch (error) {

      $q.notify({
          type: 'warning',
          message: 'No se actualizo correctamente el destino',
      });
    }

  };

  const destinoSeleccionado = async (value : GooglePlacesAutocompleteResponseModel) => {
    const {formatted_address, geometry } = value;
      destino.value.formatted_address = formatted_address;
      destino.value.data = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      }

      try {

        await recorridoRepository.updateDestino(
        {
          destino_lat: destino.value.data.lat ?? 0,
          destino_lng: destino.value.data.lng ?? 0,
          destino_formateado: destino.value.formatted_address ?? ''
        }, 
        Number(recorridoId.value));

      } catch (error) {
        $q.notify({
            type: 'warning',
            message: 'No se actualizo correctamente el destino',
        });
      }
  };
  
  const position = ref<any>({});  
  let geoId: any;
  
  onMounted(async () => {
    Geolocation.watchPosition({}, (newPosition, err) => {
      position.value = newPosition;
    });
  });
  
  onBeforeUnmount(() => {
    Geolocation.clearWatch(geoId);
  });
  
  const removerOrigin = async() => {
    origen.value.formatted_address = '';
    origen.value.data = {};
    await recorridoRepository.removerOrigen(Number(recorridoId.value));
  };

  const removerDestino = () => {
    destino.value.formatted_address = '';
    destino.value.data = {};
    recorridoRepository.removerDestino(Number(recorridoId.value));
  };

  const visitado = (parada : ParadaModel) : boolean => {
    return parada.parada_estado.codigo === 'visitado'
  }

  </script>
  
  <style>
  .number-container {
    min-width: 25px;
    /* Ajusta según sea necesario para alinear los números */
  }
  </style>