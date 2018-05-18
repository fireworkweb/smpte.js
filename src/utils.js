export function padNumber (number) {
    if (typeof number !== 'number') {
        return undefined;
    }

    return number.toString().padStart(2, '0');
}
