// A small helper to format a 10-digit phone number as (###)-###-####
export const formatPhoneNumber = (phone: string): string => {
    // 1. Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");

    // 2. Check length
    if (cleaned.length === 10) {
        // 3. Format: (123)-456-7890
        const area = cleaned.slice(0, 3);
        const middle = cleaned.slice(3, 6);
        const last = cleaned.slice(6);
        return `(${area})-${middle}-${last}`;
    }

    // If not 10 digits, just return original or handle however you prefer
    return phone;
}