import * as SecureStore from 'expo-secure-store'

import axios, { AxiosError } from 'axios'

import signOut from './signOut'
import updateAccessToken from './updateAccessToken'

import { SERVER_IP } from '@env'

const handle401 = async (): Promise <void> => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken')

    if (!refreshToken)
        return signOut()

    try {
        const response = await axios.post(`${SERVER_IP}/verifyRefreshToken`, {}, {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        })

        return await updateAccessToken(response.data.accessToken)
    }

    catch (err) {
        const error = err as AxiosError // error.response.status == 403?
        return signOut()
    }
}

export const checkAuthenticated = async (): Promise <void> => {
    const accessToken = await SecureStore.getItemAsync('accessToken')

    if (!accessToken)
        return signOut()

    try {
        return await axios.post(`${SERVER_IP}/verifyAccessToken`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
    }

    catch (err) {
        const error = err as AxiosError
        
        switch (error?.response?.status) {

            case 401:
                return await handle401()

            case 403: {
                return signOut()
            }
        }
    }
    
}