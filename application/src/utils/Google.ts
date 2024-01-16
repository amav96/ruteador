import request from './ApiResponse.helper'

export const formatAddress = (addressComponents: any[]) => {
    const ShouldBeComponent : any = {
      home: ["street_number"],
      postal_code: ["postal_code"],
      street: ["street_address", "route"],
      region: [
        "administrative_area_level_1",
        "administrative_area_level_2",
        "administrative_area_level_3",
        "administrative_area_level_4",
        "administrative_area_level_5"
      ],
      city: [
        "locality",
        "sublocality",
        "sublocality_level_1",
        "sublocality_level_2",
        "sublocality_level_3",
        "sublocality_level_4"
      ],
      country: ["country"]
    };
  
    const formattedAddress : any = {
      home: "",
      postal_code: "",
      street: "",
      region: "",
      city: "",
      country: ""
    };
  
    addressComponents.forEach(component => {
      for (const shouldBe in ShouldBeComponent) {
        if (ShouldBeComponent[shouldBe].indexOf(component.types[0]) !== -1) {
          formattedAddress[shouldBe] = shouldBe === "country"
            ? component.short_name
            : component.long_name;
        }
      }
    });
  
    return `${formattedAddress.street} ${formattedAddress.home}, ${formattedAddress.postal_code ?? ''} ${formattedAddress.city ?? formattedAddress.region}`;
};

export const GPS = () => {
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };
  return new Promise(((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  }));
};

export const obtenerInformacionUbicacion = async (lat: string, lng: string) => {
  try {
    const queryString = `latlng=${lat},${lng}&key=AIzaSyAD2gY2H88XBrGUz8sJVWYpAWkkz6n38Ds`; // Reemplaza con tu clave API de Google Maps

    const searchParams = new URLSearchParams(queryString);

    const response = await request({
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      method: 'GET',
      params: searchParams
    })
    console.log(response)
    return response

  } catch (error) {
    
    console.error('Error al obtener información de la ubicación:', error);
  }
};