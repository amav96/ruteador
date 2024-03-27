export const getId = () => {
    const randomNumber = Math.floor(Math.random() * 10000); // Genera un número aleatorio de 4 dígitos
    const currentSeconds = Math.floor(Date.now() / 1000);

    return currentSeconds + '_' + randomNumber
}

export const getHoraLlegadaEstimada = (hora_llegada_estimada: string) => {
    let horaTransformada = ''
    if(hora_llegada_estimada){
        let lastCharIndex = hora_llegada_estimada.length;
        horaTransformada = hora_llegada_estimada.substring(lastCharIndex - 8, lastCharIndex)
    }

    return horaTransformada;
}

export const getDiaActual = () => {
    let fechaActual = new Date();
    let dia = fechaActual.getDate().toString().padStart(2, '0');
    let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses van de 0 a 11
    let año = fechaActual.getFullYear().toString(); // Obtiene los últimos 2 dígitos del año

    let fechaFormateada = `${año}-${mes}-${dia}`;
    return fechaFormateada
}