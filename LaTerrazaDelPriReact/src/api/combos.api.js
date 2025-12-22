import api from "./axios";

export const getCombos = () => {
    return api.get('/combos')
}