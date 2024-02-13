<template>
    <q-page class="flex column no-wrap q-px-md full-height">

        <div class="rounded-borders bg-white">
          <q-skeleton v-if="cargandoRecorrido" height="90px" square animation="fade">
          </q-skeleton>
          <template v-else>
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
          </template>
        </div>
        
        <!-- acciones -->
        <div class="flex row items-center justify-center q-mt-xs q-mb-xs q-gutter-md">
          <!-- agregar parada -->
          <div v-if="!recorridoFinalizado" @click="goToSeleccionarParada" class="flex column items-center" :style="`${breakpoint.xs || breakpoint.sm ? 'flex-grow: 1' : ''}`">
            <q-btn  round color="deep-purple-13" icon="add" />
            <div class="pointer q-mt-sm">
              <strong>Parada</strong>
            </div>
          </div>
          <!-- optimizar recorrido -->
          <div @click="optimizarRecorrido" class="flex column items-center" :style="`${breakpoint.xs || breakpoint.sm ? 'flex-grow: 1' : ''}`">
            <template v-if="cargandoRecorrido">
              <q-skeleton type="QAvatar" />
              <q-skeleton class="full-width q-mt-xs" type="text" />
            </template>
            <template v-else-if="tieneParadas">
              <q-btn :disabled="optimizandoRecorrido" round :color="`${recorrido?.optimizado ? 'green-14' : 'deep-purple-13'}`" icon="speed" />
              <div  class="pointer q-mt-sm">
                <strong>
                  {{recorrido?.optimizado ? 'Optimizado' : 'Optimizar'  }}
                </strong>
              </div>
            </template>
          </div>
          <!-- ver mapa -->
          <div class="flex column items-center" :style="`${breakpoint.xs || breakpoint.sm ? 'flex-grow: 1' : ''}`">
            <template v-if="cargandoRecorrido">
              <q-skeleton type="QAvatar" />
              <q-skeleton class="full-width q-mt-xs" type="text" />
            </template>
            <template v-else-if="tieneParadas">
              <q-btn 
              @click="router.push({name: 'mapa-paradas'})" 
              :disabled="optimizandoRecorrido" 
              round 
              color="deep-purple-13" 
              icon="map"
              />
              <div class="pointer q-mt-sm">
                <strong>
                  Ver mapa
                </strong>
              </div>

            </template>
          </div>
        </div>
             
        <!-- skeleton de paradas -->
        <skeleton-paradas :mostrar="cargandoRecorrido" />
        
        <!-- detalle del viaje -->
        <div v-if="!cargandoRecorrido && tieneParadas && recorrido && recorrido.distancia && recorrido.duracion" class="flex row q-gutter-sm">
          <q-icon
          size="xs"
          name="directions_car"
          />
          <div class="text-weight-medium"> {{ recorrido.distancia }}</div>
          <div class="text-weight-medium" > {{ recorrido.duracion }}</div>
        </div>
        <!-- lista de paradas -->
        <q-scroll-area v-if="!cargandoRecorrido && tieneParadas" style="flex: 1;"  >
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
                @click.stop="eliminable(parada) ? eliminarParada(parada): null" 
                :name="nameIcon(parada)" 
                :color="colorParada(parada)" />
              </q-item-section>
            </q-item>
          </div>
        </q-scroll-area>

        <!-- finalizar recorrido -->
        <div v-if="!recorridoFinalizado" class="flex column q-pa-sm">
            <q-btn 
            class="q-my-sm q-py-sm" 
            label="Finalizar recorrido" 
            color="deep-purple-13" 
            unelevated 
            @click="abrirConfirmarEstadoRecorrido = !abrirConfirmarEstadoRecorrido"
            />
        </div>
        <div  v-else-if="recorridoFinalizado"
        class="flex justify-center"
         >
          <q-chip  
          class="q-mt-md " 
          color="deep-purple-13" 
          text-color="white" 
          icon-right="check">
          Finalizado
          </q-chip>
        </div>

        <!-- confirmar finalizacion -->
        <q-dialog v-model="abrirConfirmarEstadoRecorrido" persistent>
            <q-card>
                <q-card-section class="column items-center">
                <q-avatar icon="all_inbox" class="q-mb-md" color="deep-purple-13" text-color="white" />
                    <div class="q-ml-sm text-weight-bold text-subtitle1">Necesitamos su confirmación</div>
                </q-card-section>

                <q-card-actions align="right">
                <q-btn flat label="Volver" color="black"  v-close-popup />
                <q-btn 
                flat 
                label="Confirmar"  
                color="deep-purple-13" 
                v-close-popup
                @click="finalizarRecorrido"
                 />
                </q-card-actions>
            </q-card>
        </q-dialog>
       
        <dialog-loading :open="optimizandoRecorrido" text="Optimizando recorrido" />
        <dialog-loading :open="actualizandoRecorridoEstado" text="Actualizando recorrido" />

        <router-view
          @parada-seleccionada="paradaSeleccionada"
          @origen-seleccionado="origenSeleccionado"
          @destino-seleccionado="destinoSeleccionado"
          @actualizar-estado-parada="actualizarEstadoParada"
        ></router-view>

    </q-page>
</template>
  
<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import RecorridoRepository from 'src/repositories/Recorrido.repository';
  import ParadaRepository from 'src/repositories/Parada.repository';
  import { computed, onMounted, ref, onBeforeUnmount } from 'vue';
  import { Geolocation } from '@capacitor/geolocation';
  import { useQuasar } from 'quasar';
  import { AutoGpsModel, GooglePlacesAutocompleteResponseModel } from 'src/models/Google.model';
  import { CoordenadasModel } from 'src/models/Recorrido.model';
  import { ParadaModel } from 'src/models/Parada.model';
  import DialogLoading from 'src/components/General/DialogLoading.vue'
  import SkeletonParadas from 'src/modules/Recorrido/components/Parada/SkeletonParadas.vue'
  import { geoposicionar, formatearGeposiciones, formatearGoogleAddress, direccionLegible } from 'src/utils/Google';
  import { useUsuarioStore } from 'src/stores/Usuario'
  import { useRecorridoStore } from 'src/stores/Recorrido'
  import { PARADA_ESTADOS, RECORRIDO_ESTADOS } from 'src/utils/DataProviders';
  import { storeToRefs } from 'pinia';

  const router = useRouter();
  const route = useRoute();

  const $q = useQuasar();
  const breakpoint = computed(() => $q.screen)
  const usuarioStore = useUsuarioStore()
  const {
      usuario
  } = usuarioStore
  
  const recorridoRepository = new RecorridoRepository();
  const paradaRepository = new ParadaRepository();
  
  interface Way {
    formatted_address?: string ;
    data: CoordenadasModel;
  }
  const recorridoStore = useRecorridoStore()
  const { recorrido, paradas } = storeToRefs(recorridoStore)

  const origen = ref<Way>({
    formatted_address: '',
    data: {},
  });
  const autoOrigen = computed(() => origen.value.data.auto || origen.value.formatted_address === 'Tu ubicación')
  const destino = ref<Way>({
    formatted_address: '',
    data: {},
  });

  const recorridoId = computed(() => route.params.recorrido_id)

  onMounted(() => getRecorrido());
  
  const cargandoRecorrido = ref<boolean>(false)
  const getRecorrido = async () => {
    const {
      recorrido_id
    } = route.params
    const params = {
      incluir : ['paradas.paradaEstado']
    }
    try {
      const recorridoId = Number(recorrido_id)
      if(Number.isNaN(recorridoId)){
        router.push({name: 'listado-recorrido'})
      }
      cargandoRecorrido.value = true;
      const response = await recorridoRepository.get(recorridoId, params);

      if (response && Array.isArray(response) && response.length > 0) {
        const [recoridoServer] = response;
        recorrido.value = recoridoServer

        const {
          origen_lat,
          origen_lng,
          origen_formateado,
          destino_lat,
          destino_lng,
          destino_formateado,
          origen_auto,
          origen_actual_lat,
          origen_actual_lng,
          paradas : paradasServer,
          polyline: polylineServer
        } = recoridoServer

        if(origen_lat){
          origen.value.data.lat = origen_lat
        }
        if(origen_lng){
          origen.value.data.lng = origen_lng
        }
        if(origen_formateado){
          origen.value.formatted_address = origen_auto === 1 ? 'Tu ubicación' : origen_formateado
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

        if(origen_actual_lat && origen_actual_lng){
          recorrido.value.origen_actual_lat = origen_actual_lat
          recorrido.value.origen_actual_lng = origen_actual_lng
        }

        if(polylineServer){
          recorrido.value.polyline = polylineServer
        }
        
      } else {
        router.push({name: 'listado-recorrido'})
      }
      
    } catch (error) {
      
    } finally {
      cargandoRecorrido.value = false;
    }
  };
  
  const goToSeleccionarParada = (event: any) => {
    router.push({ name: 'buscar-direccion' });
  };
  
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
        paradas.value.unshift(parada)
        if(recorrido.value){
          recorrido.value.optimizado = 0;
        }
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
    
  const tieneParadas = computed(
    () => paradas.value && paradas.value?.length > 0
  );
  
  const goToSeleccionarOrigen = () => {
    router.push({ name: 'buscar-direccion', query: { origin: 1 } });
  };

  const goToSeleccionarDestino = () => {
    router.push({ name: 'buscar-direccion', query: { destination: 1 } });
  };
  
  const origenSeleccionado = async (value : GooglePlacesAutocompleteResponseModel | AutoGpsModel) => {
    let origen_formateado : string = ''
    if ('formatted_address' in value) {
      const {formatted_address, geometry } = value;
      origen.value.formatted_address = formatted_address;
      origen_formateado = formatted_address;
      origen.value.data = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      }

    } else if('auto' in value){
      if(position.value?.coords){
        const { latitude , longitude } = position.value.coords
        const geo = await geoposicionar(latitude, longitude)
        geo.results = geo.results.filter((g: any) => g.types.includes('street_address'))
        const geoFormateado = formatearGeposiciones(geo);
        
        origen.value.formatted_address = 'Tu ubicación'
        origen_formateado = geoFormateado.formatted_address
        origen.value.data = {
          lat: geoFormateado.lat,
          lng: geoFormateado.lng,
        }
      }

    }

    if(!origen.value.data.lat || !origen.value.data.lng){
      $q.notify({
          type: 'warning',
          message: 'No reconoces las coordenadas del origen',
      });
      return
    }

    if(!origen.value.formatted_address){
      $q.notify({
          type: 'warning',
          message: 'No reconoces la direccion de destino',
      });
      return
    }
  
    try {
      
      await recorridoRepository.updateOrigen(
      {
        origen_lat: origen.value.data.lat,
        origen_lng: origen.value.data.lng,
        origen_formateado,
        origen_auto: ('auto' in value) ? 1 : 0
      }, 
      Number(recorridoId.value));

      recorrido.value.origen_lat = origen.value.data.lat
      recorrido.value.origen_lng = origen.value.data.lng
      recorrido.value.origen_formateado = origen_formateado
      recorrido.value.origen_actual_lat = origen.value.data.lat
      recorrido.value.origen_actual_lng = origen.value.data.lng
      recorrido.value.origen_actual_formateado = origen_formateado

      
    } catch (error) {

     $q.notify({
         type: 'warning',
         message: JSON.stringify(error),
         timeout: 8000
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

        recorrido.value.destino_lat = destino.value.data.lat ?? 0
        recorrido.value.destino_lng = destino.value.data.lng ?? 0
        recorrido.value.destino_formateado = destino.value.formatted_address ?? ''

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
    geoId = Geolocation.watchPosition({}, (newPosition, err) => {
     
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

  const eliminable = (parada : ParadaModel) : boolean => {
    return parada.parada_estado.codigo !== 'visitado' && parada.parada_estado.tipo !== 'negativo'
  }

  const nameIcon = (parada : ParadaModel) : string => {
    if(parada.parada_estado_id === PARADA_ESTADOS.PREPARADO || parada.parada_estado_id === PARADA_ESTADOS.EN_CAMINO){
      return 'highlight_off'
    } else if(parada.parada_estado.tipo === 'positivo'){
      return 'check_circle_outline'
    } else {
      return 'cancel'
    }
  }

  const colorParada = (parada: ParadaModel) : string => {

    if(parada.parada_estado_id === PARADA_ESTADOS.PREPARADO || parada.parada_estado_id === PARADA_ESTADOS.EN_CAMINO){
      return 'grey-6'
    } else if(parada.parada_estado.tipo === 'positivo'){
      return 'green-14'
    } else {
      return 'red-13'
    }
  }

  const eliminandoParada = ref<boolean>(false)
  const eliminarParada = async (parada : ParadaModel) => {
    if(eliminandoParada.value) return 
    
    $q.dialog({
        title: '¿Estas seguro?',
        message: 'Necesitamos su confirmación',
        cancel: {
          push: true,
          color: 'red-13'
        },
        ok: {
          push: true,
          color: 'deep-purple-13',
        },
        persistent: true
      }).onOk(async () => {
        try {
          eliminandoParada.value = true
          const response = await paradaRepository.delete(parada.id)
          paradas.value = paradas.value.filter((p) => p.id !== response.id)
        } catch (error) {
          
        } finally{
          eliminandoParada.value = false
        }
      })
    // intermediates.value.splice(index, 1);
  };

  const optimizandoRecorrido = ref<boolean>(false);
  const optimizarRecorrido = async () => {
    if(!recorridoId.value){
      return
    }
    
    if(!origen.value.formatted_address){
      $q.notify({
            type: 'warning',
            message: 'Debes ingresar ubicacion de partida',
      });
      return
    }

    if(!destino.value.formatted_address){
      $q.notify({
            type: 'warning',
            message: 'Debes ingresar destino',
      });
      return
    } 
    
    optimizandoRecorrido.value = true;
    // 1) si el origen es automatico, obtener la posicion y chequear si es diferente a la posicon actual, si es diferente,
    // actualizar las posiciones actuales del recorrido 
    if(autoOrigen.value && position.value.coords){
      try {

        const { latitude , longitude } = position.value.coords
        const { origen_actual_lat , origen_actual_lng } = recorrido.value

        if(latitude !== origen_actual_lat && longitude !== origen_actual_lng){

          const geo = await geoposicionar(latitude, longitude)
          geo.results = geo.results.filter((g: any) => g.types.includes('street_address'))
          const geoFormateado = formatearGeposiciones(geo);
          await recorridoRepository.updateOrigenActual(
          {
            origen_actual_lat: latitude,
            origen_actual_lng: longitude,
            origen_actual_formateado: geoFormateado.formatted_address
          }, 
          Number(recorridoId.value));

          recorrido.value.origen_actual_lat = latitude
          recorrido.value.origen_actual_lng = longitude
          recorrido.value.origen_actual_formateado = geoFormateado.formatted_address
        }

      } catch (error) {
        optimizandoRecorrido.value = false;
        $q.notify({
            type: 'warning',
            message: 'No se actualizo correctamente el origen',
        });
      }
    }
    // 2)  optimizar el recorrido

    try {
      optimizandoRecorrido.value = true;
      const response =  await recorridoRepository.optimizar({
        recorrido_id: Number(recorridoId.value),
        rider_id: usuario.id
      })
      const { paradas: paradasServer, duracion, distancia, polyline } = response;
      if(paradasServer){
        paradas.value = [...paradasServer]
        if(recorrido.value){
          recorrido.value.optimizado = 1;
          if(duracion) recorrido.value.duracion = duracion;
          if(distancia) recorrido.value.distancia = distancia;
          recorrido.value.polyline = polyline;
          
        }
      
        $q.notify({
          type: 'positive',
          message: 'Recorrido optimizado',
          timeout: 1500
        })

      }
    } catch (error) {
      
    }  finally {
      optimizandoRecorrido.value = false;
    }

  }

  const recorridoFinalizado = computed(() => recorrido.value?.recorrido_estado_id === RECORRIDO_ESTADOS.FINALIZADO)
  const actualizandoRecorridoEstado = ref<boolean>(false)
  const abrirConfirmarEstadoRecorrido = ref<boolean>(false)
    
  const finalizarRecorrido = async () => {
   try {
    actualizandoRecorridoEstado.value = true;
    const response = await recorridoRepository.updateEstado(
      { recorrido_estado_id: RECORRIDO_ESTADOS.FINALIZADO },
      recorrido.value.id
    )
    if(response && response.recorrido_estado_id){
      recorrido.value.recorrido_estado_id = response.recorrido_estado_id
    }
   } catch (error) {
    
   } finally {
    actualizandoRecorridoEstado.value = false;
   }
   
  }
  </script>
  
  <style>
  .number-container {
    min-width: 25px;
    /* Ajusta según sea necesario para alinear los números */
  }
  </style>