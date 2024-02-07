export function base64ToFile(base64String: string, filename: string, mimeType: string): Promise<File> {
    return new Promise((resolve, reject) => {
        // Decodifica la cadena base64 en un ArrayBuffer
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const arrayBuffer = new ArrayBuffer(byteArray.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        uint8Array.set(byteArray);

        // Crea un Blob a partir del ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: mimeType });

        // Crea un objeto File a partir del Blob
        const file = new File([blob], filename, { type: mimeType });

        // Resuelve la promesa con el objeto File
        resolve(file);
    });
}