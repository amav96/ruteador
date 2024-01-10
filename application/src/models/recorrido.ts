export interface RecorridoModel {
    routes: {
        distanceMeters: number;
        duration: string,
        optimizedIntermediateWaypointIndex: any[]
    }[]
}