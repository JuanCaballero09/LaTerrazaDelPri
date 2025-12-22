import api from './axios'

export const getBanners = () => {
    return api.get('/banners')
}