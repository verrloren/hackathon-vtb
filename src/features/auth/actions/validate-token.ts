'use server';

import { redirect } from 'next/navigation';
import { getToken } from "@/features/auth";


type DataType = {
    success: boolean;
    response: string;
    statusCode?: number;
}

export const validateToken = async (): Promise<DataType> => {
    try {
			const { token } = await getToken();

			if (!token) {
				return { success: false, response: "No access token" };
			}

        const result = await fetch(`${process.env.BACKEND_API_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.BACKEND_API_KEY as string,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (result.status === 401) {
            console.error('Unauthorized access');
            redirect('/auth/login');
        }

        if (!result.ok) {
            console.error('API Error:', {
                status: result.status,
                statusText: result.statusText
            });
            return {
                success: false,
                response: `Server Error`,
                statusCode: result.status
            };
        }

        const data = await result.json();
        return {
            success: true,
            response: data.response,
            statusCode: result.status
        };
    } catch (error) {
        console.error('Token Validation Error:', error);
        return {
            success: false,
            response: "Authentication failed",
            statusCode: 500
        };
    }
};