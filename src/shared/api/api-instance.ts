

class ApiError extends Error {
	constructor(public response: Response) {
		super("API error" + response.statusText);
	}
}

export const jsonApiInstance = async <T>(
url: string,
	init?: RequestInit & { json: unknown }) => {
	//добавить заголовки
	let headers = init?.headers ?? {};
	if (init?.json) {
		headers = {
			'Content-Type': 'application/json',
			...headers
		};
		init.body = JSON.stringify(init.json);
 	}
	const result = await fetch(`${process.env.BACKEND_API_URL}${url}`, {
		...init,
		headers
	})

	if (result.status === 401 || result.status === 422) {
		return null as T;
	}


	if (!result.ok) {
		throw new ApiError(result);
	}
	const data = (await result.json()) as Promise<T>;
	return data;
}