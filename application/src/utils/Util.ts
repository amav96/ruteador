export const getId = () => {
    const randomNumber = Math.floor(Math.random() * 10000); // Genera un número aleatorio de 4 dígitos
    const currentSeconds = Math.floor(Date.now() / 1000);

    return currentSeconds + '_' + randomNumber
}