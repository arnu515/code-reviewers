export function handleAxiosError(e: any): string {
    if (e.response) {
        return (
            e.response.data.message ||
            "An unknown error occured: " + e.response.status
        );
    } else {
        return JSON.stringify(e);
    }
}
