export { generateFileName };

function generateFileName(): string {
    const date = new Date();
    
    // YYYY-MM-DD
    const date_string = date.toISOString().split('T')[0];

    const currentHour = numberToStringWithFixedLength(date.getHours(), 2);
    const currentMinute = numberToStringWithFixedLength(date.getMinutes(), 2);
    const currentSeconds = numberToStringWithFixedLength(date.getSeconds(), 2);

    return `videology-${date_string}-${currentHour}-${currentMinute}-${currentSeconds}`;
}

/**
 * Convert number to string with fixed width,
 * puts zeros before first number
 * 
 * @param number
 * @param width
 * 
 * @example
 * numberToString(2, 2) -> "02"
 * 
 * @example
 * numberToString(35, 3) -> "035"
 */
function numberToStringWithFixedLength(number: number, width: number): string {
    const repeated_zeros = "0".repeat(width);

    return `${repeated_zeros}${number}`.slice(-width);
}