export interface GooglePlacesAutocompleteResponseModel {
    address_components: AddressComponentModel[];
    formatted_address: string;
    geometry: GeometryModel;
    place_id: string;
    plus_code: PlusCodeModel;
    types: string[];
    customName: string; // Personalizado según tus necesidades
    id?: number
}

export interface AddressComponentModel {
    long_name: string;
    short_name: string;
    types: string[];
}

export interface GeometryModel {
    location: LocationModel;
    location_type: string;
    viewport: ViewportModel;
}

export interface LocationModel {
    lat: Function;
    lng: Function;
}

export interface ViewportModel {
    south: number;
    west: number;
    north: number;
    east: number;
}

export interface PlusCodeModel {
    compound_code: string;
    global_code: string;
}

export interface AutoGpsModel {
    auto?: boolean 
}

export interface FormateadorGoogleAddressModel {
    formatted_address: string;
    localidad: string;
    provincia: string;
    codigo_postal: string;
    numero: string;
    calle: string;
}