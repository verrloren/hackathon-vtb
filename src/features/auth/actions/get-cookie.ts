'use server';

import { ResponseDto } from "@/shared/";


 export const getCookie = async () => {
		try {
			const result = await fetch(`${process.env.BACKEND_API_URL}/api/users/login`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					'X-API-KEY': process.env.BACKEND_API_KEY as string
				},
			})

			const { success, response } = await result.json();

			const data: ResponseDto = { success, response	}

			if(!success || !response) {
				return data
			}
	
			return data;

		} catch (error) {
			console.error(error)
		}
 }