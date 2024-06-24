interface ClientEventProps {
    url: string;
    title: string;
    appFunction: string;
    appComponent: string;
    details: object;
}

export async function trackClientEvent(props: ClientEventProps) {
    try {
        const url = props.url.startsWith("localhost")
            ? `http://${props.url}/api/v1/logs`
            : `https://${props.url}/api/v1/logs`;
        await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: props.title,
                appComponent: props.appComponent,
                appFunction: props.appFunction,
                details: props.details,
            }),
        });
    } catch (err) {}
}
