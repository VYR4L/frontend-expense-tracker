export const URL = __BACKEND_URL__;

export function authHeader() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
    }
}