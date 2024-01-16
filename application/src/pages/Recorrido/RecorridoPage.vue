<template>
    <q-page class="bg-grey-2 q-px-md">
      <div>
        <div class="rounded-borders bg-white ">
          <q-input
            label="Ubicación de partida"
            borderless
            class="text-body1"
            color="deep-purple-13"
            v-model="origin.formatted_address"
            @click="selectOrigin"
          >
            <template v-slot:prepend>
              <q-icon
                :class="`q-ml-sm ${autoOrigin ? 'text-blue' : ''}`"
                :name="autoOrigin ? 'gps_fixed' : 'explore'"
              />
            </template>
            <template v-slot:append>
              <q-icon
                name="highlight_off"
                color="deep-purple-13"
                :class="`q-mr-sm ${autoOrigin ? 'pointeer' : ''}`"
                @click="removeOrigin"
                
              />
            </template>
          </q-input>
    
          <q-input
            :label="!destination ? 'Elige donde quieres terminar' : 'Destino'"
            borderless
            class="text-body1"
            color="deep-purple-13"
            v-model="destination.formatted_address"
            @click="selectDestination"
          >
            <template v-slot:prepend>
              <q-icon
                :class="`q-ml-sm`"
                name="place"
              />
            </template>
            <template v-slot:append>
              <q-icon
                name="highlight_off"
                color="deep-purple-13"
                :class="`q-mr-sm ${destination ? 'pointeer' : ''}`"
                @click="removeDestination"
              />
            </template>
          </q-input>
        </div>
  
        <div class="flex row items-center q-py-xs q-my-xs">
          <q-btn @click="addStop" round color="deep-purple-13" icon="add" />
          <div @click="addStop" class="q-ml-sm pointer ">
            <strong>Agregar parada</strong>
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
          @select-origin="setOrigin({data: $event})"
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
  import { useRouter } from 'vue-router';
  import RecorridoRepository from 'src/repositories/RecorridoRepository';
  import { computed, watch, onMounted, ref } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import { Geolocation } from '@capacitor/geolocation';
  import { onBeforeUnmount } from 'vue';
  import { useQuasar } from 'quasar';
  import { VueDraggable } from 'vue-draggable-plus';
  import { RecorridoModel } from 'src/models/recorrido';
  
  const $q = useQuasar();
  
  const recorridoRepository = new RecorridoRepository();
  
  const tab = ref('crearrecorrido');
  
  interface Way {
    formatted_address?: string ;
    data: any;
  }
  
  const origin = ref<Way>({
    formatted_address: '',
    data: {},
  });
  const autoOrigin = ref<boolean>(false);
  const destination = ref<Way>({
    formatted_address: '',
    data: {},
  });
  
  const router = useRouter();
  
  const addStop = (event: any) => {
    router.push({ name: 'buscar-direccion' });
  };
  
  const intermediates = ref<any[]>([]);
  
  watch(
    intermediates,
    async (newVal) => {
      try {
        const storage_recorrido = await recorridoRepository.getRecorrido();
  
        recorridoRepository.setRecorrido({
          ...storage_recorrido,
          intermediates: newVal,
        });
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
  
  onMounted(() => getRecorridoPersistido());
  
  const getRecorridoPersistido = async () => {
    const storage_recorridoActual = await recorridoRepository.getRecorrido();
  
    if (storage_recorridoActual) {
      if (storage_recorridoActual.intermediates) {
        intermediates.value = storage_recorridoActual.intermediates;
      }
      if (storage_recorridoActual.origin) {
        setOrigin(storage_recorridoActual.origin);
      }
  
      if (storage_recorridoActual.destination) {
        setDestination(storage_recorridoActual.destination);
      }
    }
  };
  
  const tieneRecorrido = computed(
    () => intermediates && intermediates.value.length > 0
  );
  const cargandoRecorrido = ref<boolean>(false);
  const obtenerRecorrido = async () => {
    if (cargandoRecorrido.value) return;
    cargandoRecorrido.value = true;
  
    if (!origin.value.formatted_address || !destination.value.formatted_address) {
      $q.notify({
        type: 'warning',
        message: 'Debes ingresar punto de partida y donde quieres terminar',
      });
      return;
    }

    const latLngOrigin = origin.value.data.location.latLng;
    if (!latLngOrigin.latitude || !latLngOrigin.longitude) {
      $q.notify({
        type: 'warning',
        message: 'No hemos podido determinar tu ubicación',
      });
      return;
    }
  
    const latLngDestination = destination.value.data.location.latLng;
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
        location: destination.value.data.location,
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
    let orden = recorrido.routes[0].optimizedIntermediateWaypointIndex;
    const reordenar = orden.map((posicion) => intermediates.value[posicion]);
    intermediates.value = reordenar;
  };
  
  const verRecorridoGoogleMaps = () => {
    const waypoints = intermediates.value.map(
      (waypoint) => `${waypoint.location.lat},${waypoint.location.lng}`
    );
 
    const originPath = `${origin.value.data.location.latLng.latitude},${origin.value.data.location.latLng.longitude}`;
    const destinationPath = `${destination.value.data.location.latLng.latitude},${destination.value.data.location.latLng.longitude}`;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${originPath}&destination=${destinationPath}&travelmode=driving&waypoints=${waypoints.join(
      '|'
    )}`;
  
    window.open(url);
  };
  
  const selectOrigin = () => {
    router.push({ name: 'buscar-direccion', query: { origin: 1 } });
  };
  
  const setOrigin = async (value: { data: any , formatted_address?: string}) => {
    
    const { data: { auto , formatted_address} } = value;
    
    origin.value = {
        ...origin.value,
        ...value
    };

    if (formatted_address) {
      if (formatted_address.length > 35) {
        origin.value.formatted_address = formatted_address.substr(0, 35) + '...';
      } else {
        origin.value.formatted_address = formatted_address;
      }
  
      const latLngOrigin = await getOriginLocation();
      origin.value.data.location = {
        latLng: {
          latitude: latLngOrigin.latitude,
          longitude: latLngOrigin.longitude,
        },
      };
    } 
    
    if (auto) {
      autoOrigin.value = true;
      const latLngOrigin = await getOriginLocation();
     
    }
  
    recorridoRepository.setOrigin(origin.value);
  };
  
  const position = ref<any>({});
  const getOriginLocation = async (): Promise<{ latitude: number; longitude: number }> => {
    const { data } = origin.value;
   
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
  
  watch(autoOrigin, (val) => {
    if (autoOrigin.value) {
      origin.value.formatted_address = 'Tu ubicación';
    } else {
      origin.value.formatted_address = '';
    }
  });
  
  const removeOrigin = () => {
    autoOrigin.value = false;
    origin.value.formatted_address = '';
    origin.value.data = {};
    recorridoRepository.removeOrigin();
  };
  
  const selectDestination = () => {
    router.push({ name: 'buscar-direccion', query: { destination: 1 } });
  };
  
  const setDestination = (value: { data: any , formatted_address?: string}) => {
    const { formatted_address } = value;
  
    destination.value.data = value;
    if (formatted_address) {
      if (formatted_address.length > 35) {
        destination.value.formatted_address =
          formatted_address.substr(0, 35) + '...';
      } else {
        destination.value.formatted_address = formatted_address;
      }
  
      const latLngDestination = getDestinationLocation();
      destination.value.data.location = {
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
    } = destination.value.data;
  
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
  
  const removeDestination = () => {
    destination.value.formatted_address = '';
    destination.value.data = {};
    recorridoRepository.removeDestination();
  };
  
  </script>
  
  <style>
  .number-container {
    min-width: 25px;
    /* Ajusta según sea necesario para alinear los números */
  }
  </style>