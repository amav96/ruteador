<template>
    <q-page class="bg-grey-2 q-px-md">
      <div>
        <div class="rounded-borders bg-white ">
          <q-input
            label="Ubicación de partida"
            borderless
            class="text-body1"
            color="deep-purple-13"
            v-model="origen.formatted_address"
            @click="goToSelectOrigen"
          >
            <template v-slot:prepend>
              <q-icon
                :class="`q-ml-sm ${autoOrigen ? 'text-blue' : ''}`"
                :name="autoOrigen ? 'gps_fixed' : 'explore'"
              />
            </template>
            <template v-if="origen.formatted_address" v-slot:append>
              <q-icon
                name="highlight_off"
                color="deep-purple-13"
                :class="`q-mr-sm ${autoOrigen ? 'pointeer' : ''}`"
                @click="removerOrigin"
              />
            </template>
          </q-input>
    
          <q-input
            :label="!destino ? 'Elige donde quieres terminar' : 'Destino'"
            borderless
            class="text-body1"
            color="deep-purple-13"
            v-model="destino.formatted_address"
            @click="selectDestination"
          >
            <template v-slot:prepend>
              <q-icon
                :class="`q-ml-sm`"
                name="place"
              />
            </template>
            <template v-if="destino.formatted_address" v-slot:append>
              <q-icon
                name="highlight_off"
                color="deep-purple-13"
                :class="`q-mr-sm ${destino ? 'pointeer' : ''}`"
                @click="removerDestino"
              />
            </template>
          </q-input>
        </div>
  
        <div class="flex row items-center justify-center q-my-md">
          <div class="flex column items-center">
            <q-btn @click="addStop" round color="deep-purple-13" icon="add" />
            <div @click="addStop" class="pointer q-my-sm">
              <strong>Parada</strong>
            </div>
          </div>
        </div>
  
        <template v-if="tieneRecorrido">
          <q-scroll-area style="height: 55vh" class="q-py-sm">
            <div v-for="(parada, index) in intermediates" :key="index">
              <q-item clickable v-ripple class="list-group-item bg-white rounded-borders q-my-sm">
                <q-item-section @click="openUpdateAddress(parada, parada.id)">
                  <div class="flex row items-center">
                    <div class="q-mr-sm text-weight-bold number-container">
                      {{ index + 1 }} -
                    </div>
                    <div class="flex wrap text-body1" style="max-width: 85%;">
                      {{ parada.formatted_address }}
                    </div>
                  </div>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon size="xs" @click="removeAddres(index)" name="close" color="deep-purple-13" />
                </q-item-section>
              </q-item>
              
            </div>
          </q-scroll-area>
        </template>
  
        <router-view
          @selected-address="handleAddress"
          @select-origin="origenSeleccionado"
          @select-destination="setDestination"
        ></router-view>
      </div>
  
      <!-- <q-footer reveal bordered class="bg-grey-8 text-white">
        <q-tabs v-model="tab" class="bg-deep-purple-13 text-white shadow-2">
          <q-tab
            @click="obtenerRecorrido"
            v-if="tieneRecorrido"
            name="crearrecorrido"
            label="Crear recorrido"
            icon="near_me"
          />
          <q-tab
            @click="verRecorridoGoogleMaps"
            name="verrecorrido"
            label="Ver recorrido"
            icon="map"
          />
        </q-tabs>
      </q-footer> -->
    </q-page>
</template>
  
  <script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import RecorridoRepository from 'src/repositories/RecorridoRepository';
  import { computed, watch, onMounted, ref } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import { Geolocation } from '@capacitor/geolocation';
  import { onBeforeUnmount } from 'vue';
  import { useQuasar } from 'quasar';
  import { VueDraggable } from 'vue-draggable-plus';
  import { RecorridoModel } from 'src/models/Recorrido.model';
  import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
  import { CoordenadasModel, UpdateOrigenRequest } from 'src/models/Recorrido.model';
import { geoposicionar, formatearGeposiciones } from 'src/utils/Google';
  
  const $q = useQuasar();
  
  const recorridoRepository = new RecorridoRepository();
  
  const tab = ref('crearrecorrido');
  
  interface Way {
    formatted_address?: string ;
    data: CoordenadasModel;
  }
  
  const origen = ref<Way>({
    formatted_address: '',
    data: {},
  });
  const autoOrigen = ref<boolean>(false);
  const destino = ref<Way>({
    formatted_address: '',
    data: {},
  });
  
  const router = useRouter();
  const route = useRoute();
  
  const recorridoId = computed(() => route.params.recorrido_id)
  
  const addStop = (event: any) => {
    router.push({ name: 'buscar-direccion' });
  };
  
  const intermediates = ref<any[]>([]);
  
  watch(
    intermediates,
    async (newVal) => {
      try {

        const {
        recorrido_id
        } = route.params
        // console.log("watch")
        // console.log(intermediates.value)
        // const storage_recorrido = await recorridoRepository.getRecorrido(Number(recorrido_id));
  
        // recorridoRepository.setRecorrido({
        //   ...storage_recorrido,
        //   intermediates: newVal,
        // });
      } catch (error) {
        console.log(error);
      }
    },
    { deep: true }
  );
  
  const handleAddress = (data: any) => {
    if (!data.hasOwnProperty('id')) {
      addAddress(data);
    } else {
      updateAddress(data);
    }
  };
  
  const addAddress = async (data: any) => {
    intermediates.value.push({
      formatted_address: data.formatted_address,
      name: data.name,
      location: {
        lat: data.geometry.location.lat(),
        lng: data.geometry.location.lng(),
      },
      id: uuidv4(),
    });

  };
  
  const updateAddress = async (data: any) => {
    intermediates.value = intermediates.value.map((rec) => {
      if (rec.id === data.id) {
        rec = {
          formatted_address: data.formatted_address,
          name: data.name,
          location: {
            lat: data.geometry.location.lat(),
            lng: data.geometry.location.lng(),
          },
        };
        return rec;
      }
      return rec;
    });
  };
  
  const openUpdateAddress = (data: any, id: number) => {
    router.push({
      name: 'buscar-direccion',
      query: { addressValue: data.formatted_address, id },
    });
  };
  
  const removeAddres = async (index: number) => {
    intermediates.value.splice(index, 1);
  };
  
  onMounted(() => getRecorrido());
  
  const getRecorrido = async () => {
    const {
      recorrido_id
    } = route.params
    const relaciones = ['paradas'];
    try {

      const response = await recorridoRepository.get(Number(recorrido_id), relaciones);
      
      if (response && response.length > 0) {
        const [recorrido] = response;
        if(recorrido.origen_lat){
          origen.value.data.lat = recorrido.origen_lat
        }
        if(recorrido.origen_lng){
          origen.value.data.lng = recorrido.origen_lng
        }
        if(recorrido.origen_formateado){
          origen.value.formatted_address = recorrido.origen_formateado
        }
        console.log(recorrido)
        // if (response.intermediates) {
        //   intermediates.value = response.intermediates;
        // }
        // if (response.origin) {
        //   origenSeleccionado(response.origin);
        // }
    
        // if (response.destination) {
        //   setDestination(response.destination);
        // }
      }
      
    } catch (error) {
      
    }
  };
  
  const tieneRecorrido = computed(
    () => intermediates && intermediates.value.length > 0
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
  
  const goToSelectOrigen = () => {
    router.push({ name: 'buscar-direccion', query: { origin: 1 } });
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
  
  const position = ref<any>({});
  const getOriginLocation = async (): Promise<{ latitude: number; longitude: number }> => {
    const { data } = origen.value;
   
    if (data.auto) {
      if (
        !position.value?.coords?.latitude ||
        !position.value?.coords?.longitude
      ) {

        const currentPosition = await getCurrentPosition()

        if(!currentPosition.coords.latitude || !currentPosition.coords.longitude){
            $q.notify({
                type: 'warning',
                message: 'No reconocemos tu ubicacion. Intente en otro momento',
            });
  
            return {
                latitude: 0,
                longitude: 0,
            }
        } else {
            position.value = currentPosition
        }

      }
      
   

      return {
        latitude: position.value.coords.latitude,
        longitude: position.value.coords.longitude,
      };
    }

    if (data && Object.keys(data).length > 0) {
      const {
        geometry: { location: { lat, lng } },
      } = data;
      return {
        latitude: lat,
        longitude: lng,
      };
    }
  
    return {
      latitude: 0,
      longitude: 0,
    };
  };

  const getCurrentPosition = async () => {
    return await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
  };
  
  let geoId: any;
  
  onMounted(async () => {
    await getCurrentPosition();
    Geolocation.watchPosition({}, (newPosition, err) => {
      position.value = newPosition;
    });
  });
  
  onBeforeUnmount(() => {
    Geolocation.clearWatch(geoId);
  });
  
  watch(autoOrigen, (val) => {
    if (autoOrigen.value) {
      origen.value.formatted_address = 'Tu ubicación';
    } else {
      origen.value.formatted_address = '';
    }
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
  
  const selectDestination = () => {
    router.push({ name: 'buscar-direccion', query: { destination: 1 } });
  };
  
  const setDestination = (value: { data: any , formatted_address?: string}) => {
    const { formatted_address } = value;
  
    destino.value.data = value;
    if (formatted_address) {
      if (formatted_address.length > 35) {
        destino.value.formatted_address =
          formatted_address.substr(0, 35) + '...';
      } else {
        destino.value.formatted_address = formatted_address;
      }
  
      const latLngDestination = getDestinationLocation();
      destino.value.data.location = {
        latLng: {
          latitude: latLngDestination.latitude,
          longitude: latLngDestination.longitude,
        },
      };
    }
  
    recorridoRepository.setDestination(value);
  };
  
  const getDestinationLocation = (): { latitude: number; longitude: number } => {

    const {
      geometry: { location: { lat, lng } },
    } = deestino.value.data;
  
    if (lat && lng) {
      return {
        latitude: lat,
        longitude: lng,
      };
    }
  
    return {
      latitude: 0,
      longitude: 0,
    };
  };
  

  
  </script>
  
  <style>
  .number-container {
    min-width: 25px;
    /* Ajusta según sea necesario para alinear los números */
  }
  </style>