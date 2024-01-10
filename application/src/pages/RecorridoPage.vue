<template>
    <q-page >
        <div>
            <!-- <q-input 
            class="q-mb-lg q-mr-md q-ml-md" 
            @focus="inputFocus" 
            rounded 
            outlined 
            label="Ingresa las paradas del recorrido"
            v-model="address" 
            /> -->

            <q-input 
            label="Ubicación de partida" 
            v-model="origin.formatted_address" 
            @click="selectOrigin"
            class="text-body1"
            >
                <template v-slot:prepend>
                    <q-icon :class="`q-ml-sm ${'text-blue'}`" :name="autoOrigin ? 'gps_fixed' : 'explore'" />
                </template>

                <template   v-slot:append>
                    <q-icon @click="removeOrigin" :class="`q-mr-sm`" name="highlight_off" />
                </template>
            </q-input>

            <q-input 
            class="text-body1" 
            :label="!destination ? 'Elige donde quieres terminar' : 'Destino'" 
            v-model="destination.formatted_address" 
            @click="selectDestination"

            >
                <template v-slot:prepend>
                    <q-icon :class="`q-ml-sm ${destination ? 'text-blue' : ''}`" name="place" />
                </template>

                <template   v-slot:append>
                    <q-icon @click="removeDestination" :class="`q-mr-sm`" name="highlight_off" />
                </template>
            </q-input>

            <div class="flex row items-center q-pa-sm q-my-sm">
                <q-btn 
                @click="addStop"
                round color="primary" icon="add" />
                <div @click="addStop" class="q-ml-sm text-blue pointeer" >Agregar parada</div>
            </div>

            <template  v-if="tieneRecorrido"
            >
                <q-scroll-area style="height: 55vh">
                    <!-- <div>
                        <VueDraggable 
                        ref="el" 
                        v-model="intermediates"
                        
                         > -->
                            <div
                            v-for="(parada, index) in intermediates"
                            :key="index"
                            >
                                <!-- <q-separator v-if="index === 0" /> -->
                                <q-item 
                                clickable 
                                v-ripple
                                class="list-group-item"
                                >
                                    <q-item-section 
                                    @click="openUpdateAddress(parada, parada.id)"> 
                                        <div class="flex row items-center"> 
                                            <div class="q-mr-sm text-weight-bold number-container" > {{ index + 1  }} - </div> 
                                            <div class="flex wrap text-body1" style="max-width: 85%;">
                                                {{ parada.formatted_address }} 
                                            </div>
                                        </div>
                                    </q-item-section>
                                    <q-item-section avatar>
                                        <q-icon size="xs" @click="removeAddres(index)" name="close"  />
                                    </q-item-section>
                                    
                                </q-item>
                                <q-separator />
                            </div>
                        <!-- </VueDraggable>
                    </div> -->
                </q-scroll-area>
            </template>

            <router-view
            @selected-address="handleAddress"
            @select-origin="handleOrigin"
            @select-destination="handleDestination"
            >
            </router-view>
        </div>

        <q-footer reveal bordered class="bg-grey-8 text-white">
            <q-tabs
            v-model="tab"
            class="bg-primary text-white shadow-2"
            >
                
                <q-tab @click="obtenerRecorrido" v-if="tieneRecorrido" name="crearrecorrido" label="Crear recorrido" icon="near_me" />
                <q-tab @click="verRecorridoGoogleMaps" name="verrecorrido" label="Ver recorrido" icon="map" />
                <!-- <q-tab name="mails" label="Mails" icon="mail" /> -->
                
            </q-tabs>
      </q-footer>
    </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
// @ts-ignore
import RecorridoRepository from 'src/repositories/RecorridoRepository'
import { computed, watch, onMounted, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Geolocation } from '@capacitor/geolocation'
import { onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar'
import { VueDraggable } from 'vue-draggable-plus'
import { RecorridoModel } from 'src/models/recorrido'

    const $q = useQuasar()

    const recorridoRepository = new RecorridoRepository()

    const tab = ref('crearrecorrido')

    interface Way {
        formatted_address: string,
        data: any
    }

    const origin = ref<Way>({
        formatted_address: '',
        data: {}
    });
    const autoOrigin = ref<boolean>(false);
    const destination = ref<Way>({
        formatted_address: '',
        data: {}
    });

    const router = useRouter();

    const addStop = (event: any) => {
        router.push({name: 'buscar-direccion'})
    }

    const intermediates = ref<any[]>([]);

    watch(intermediates, async (newVal) => {
         try {
             const storage_recorrido = await recorridoRepository.getRecorrido();

             recorridoRepository.setRecorrido({
                 ...storage_recorrido,
                 intermediates: newVal,
             });
            
         } catch (error) {
             console.log(error)
         }
    }, {deep: true})

    const handleAddress = (data: any) => {
        if(!data.hasOwnProperty('id')){
            console.log('added')
            addAddress(data)
        } else {
            console.log('updating', data)
            updateAddress(data)
        }
    }

    const addAddress = async (data: any) => {
        intermediates.value.push({
            formatted_address: data.formatted_address,
            name: data.name,
            location: {
                lat : data.geometry.location.lat(),
                lng: data.geometry.location.lng()
            },
            id :  uuidv4()
        })
        console.log(intermediates.value)
       
    }

    const updateAddress = async (data: any) => {

        intermediates.value = intermediates.value.map((rec) => {
            if(rec.id === data.id){
                rec = {
                    formatted_address: data.formatted_address,
                    name: data.name,
                    location: {
                        lat : data.geometry.location.lat(),
                        lng: data.geometry.location.lng()
                    },
                }
                return rec
            }
            return rec
        })

    }

    const openUpdateAddress = (data: any, id: number) => {
        router.push({name: 'buscar-direccion', query: {addressValue: data.formatted_address, id}})
    }

    const removeAddres = async (index: number) => {
        intermediates.value.splice(index, 1)
    }

    onMounted(() => getRecorrido())

    const getRecorrido = async () => {
        const storage_recorridoActual = await recorridoRepository.getRecorrido()
       
        if(storage_recorridoActual){
            if(storage_recorridoActual.intermediates){
                intermediates.value = storage_recorridoActual.intermediates
            }
            if(storage_recorridoActual.origin){
                setOrigin(storage_recorridoActual.origin)
            }

            if(storage_recorridoActual.destination){
                setDestination(storage_recorridoActual.destination)
            }
        }
    }

    const tieneRecorrido = computed(() => intermediates && intermediates.value.length > 0)
    const cargandoRecorrido = ref<boolean>(false);
    const requestRouterApi = ref<any>()
    const obtenerRecorrido = async () => {

        if(cargandoRecorrido.value) return
        cargandoRecorrido.value = true

        if(!origin.value.formatted_address || !destination.value.formatted_address){
            $q.notify({
                type: 'warning',
                message: 'Debes ingresar punto de partida y donde quieres terminar'
            })
            return
        }

        const latLngOrigin = origin.value.data.location
        if(!latLngOrigin.latitude || !latLngOrigin.longitude){
            $q.notify({
                type: 'warning',
                message: 'No hemos podido determinar tu ubicación'
            })
            return
        }

        const latLngDestination = destination.value.data.location
        if(!latLngDestination.latitude || !latLngDestination.longitude){
            $q.notify({
                type: 'warning',
                message: 'No hemos podido determinar tu destino'
            })
            return
        }

        const request = {
            origin : {
                location : origin.value.data.location,
            },
            destination : {
                location : destination.value.data.location,
            },
            intermediates: intermediates.value
        }
        console.log(request)
        return

        requestRouterApi.value = request

        try {
            $q.loading.show()
            const response = await recorridoRepository.obtenerRecorrido(request)
            const { data : { recorrido }} = response
            reordenarRecorrido(recorrido)
        } catch (error) {
            
        } finally{
            cargandoRecorrido.value = false
            $q.loading.hide()
        }
        
    }
    
    const reordenarRecorrido = (recorrido: RecorridoModel) => {
        // Crear un nuevo array que contenga los índices ordenados según el primer array
        let orden = recorrido.routes[0].optimizedIntermediateWaypointIndex
        const reordenar = orden.map(posicion => intermediates.value[posicion]);
        intermediates.value = reordenar
    }

    const verRecorridoGoogleMaps = () => {

        const waypoints = intermediates.value.map((waypoint) => `${waypoint.location.lat},${waypoint.location.lng}`);
        const origin = `${requestRouterApi.value.origin.location.latLng.latitude},${requestRouterApi.value.origin.location.latLng.longitude}`;
        const destination = `${requestRouterApi.value.destination.location.latLng.latitude},${requestRouterApi.value.destination.location.latLng.longitude}`;
        console.log({
            origin,
            destination
        })

        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&waypoints=${waypoints.join("|")}`;
      
        window.open(url);

        // const origin = `${requestRouterApi.value.origin.location.latLng.latitude},${requestRouterApi.value.origin.location.latLng.longitude}`;
        // const destination = `${requestRouterApi.value.destination.location.latLng.latitude},${requestRouterApi.value.destination.location.latLng.longitude}`;

        // const waypoints = intermediates.value.slice(1, -1).map(address => `via:${address.formatted_address}`).join('|');
        // // NO BORRAR, ESO USA LA API V1 DE DIRECICONES
        // const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${waypoints}&key=AIzaSyAD2gY2H88XBrGUz8sJVWYpAWkkz6n38Ds`

    }


    const getCurrentPosition = async () => {
        
        const newPosition = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
       
        position.value = newPosition
        // const {
        //     latitude,
        //     longitude
        // } = position.value.coords;
        
        // const geocode = await obtenerInformacionUbicacion(latitude, longitude)
    
    }

    let geoId : any

    onMounted(() => {
      getCurrentPosition()

      // we start listening
      geoId = Geolocation.watchPosition({}, (newPosition, err) => {
        position.value = newPosition
      })
    })

    onBeforeUnmount(() => {
      // we do cleanup
      Geolocation.clearWatch(geoId)
    })

    const selectOrigin = () => {
        router.push({name: 'buscar-direccion', query: {origin: 1}})
    }

    const handleOrigin = (value: object) => {
        setOrigin(value)
    }

    const setOrigin = (value: any) => {
        console.log(value)
        const {
            auto,
            formatted_address
        } = value

        origin.value.data = value

        if(formatted_address){
            if(formatted_address.length > 35){
                origin.value.formatted_address = formatted_address.substr(0,35) +'...'
            } else {
                origin.value.formatted_address = formatted_address
            }

            const latLngOrigin = getOriginLocation()
            origin.value.data.location = {
                latLng: {
                    latitude: latLngOrigin.latitude,
                    longitude: latLngOrigin.longitude,
                }
            }
            
        } else if(auto){
            autoOrigin.value = true;
        }

        recorridoRepository.setOrigin(origin.value);
    }

    const position = ref<any>({})
    const getOriginLocation = () : { latitude: number, longitude: number } => {

        const {
            data 
        } = origin.value
        
        if(data.auto){
            if(!position.value?.coords?.latitude || !position.value?.coords?.longitude){
                    $q.notify({
                    type: 'warning',
                    message: 'No reconocemos tu ubicacion. Intente en otro momento'
                })
            }
            return {
                latitude: position.value.coords.latitude,
                longitude: position.value.coords.longitude,
            }
        }
        
        if(data && Object.keys(data).length > 0){
            const {
                geometry: { location : { lat, lng }}
            } = data
            return {
                latitude: lat,
                longitude: lng,
            }
        }

        return {
            latitude: 0,
            longitude: 0
        }
    
        
    }

    watch(autoOrigin, (val) => {
        if(autoOrigin.value){
            origin.value.formatted_address = 'Tu ubicación'
        } else {
            origin.value.formatted_address = ''
        }
    })

    const removeOrigin = () => {
        autoOrigin.value = false
        origin.value.formatted_address = ''
        origin.value.data = {}
        recorridoRepository.removeOrigin()
    }

    const selectDestination = () => {
        router.push({name: 'buscar-direccion', query: {destination: 1}})
    }

    const handleDestination = (value: object) => {
        setDestination(value)
    }

    const setDestination = (value: any) => {

        const {
            formatted_address
        } = value

        destination.value.data = value
        if(formatted_address){
            if(formatted_address.length > 35){
                destination.value.formatted_address = formatted_address.substr(0,35) +'...'
            } else {
                destination.value.formatted_address = formatted_address
            }

            const latLngDestination = getDestinationLocation()
            destination.value.data.location = {
                latLng: {
                    latitude: latLngDestination.latitude,
                    longitude: latLngDestination.longitude,
                }
            }
            
        } 
        
        recorridoRepository.setDestination(value);
    }

    const getDestinationLocation = () : { latitude: number, longitude: number } => {
        const {
            geometry : { location : { lat, lng }}
        } = destination.value.data

        if(lat && lng){
            return {
                latitude: lat,
                longitude: lng
            }
        }

        return {
            latitude: 0,
            longitude: 0
        }
    }

    const removeDestination = () => {
        destination.value.formatted_address = ''
        destination.value.data = {}
        recorridoRepository.removeDestination()
    }


</script>
<style>

.number-container {
    min-width: 25px; /* Ajusta según sea necesario para alinear los números */
  }

</style>
