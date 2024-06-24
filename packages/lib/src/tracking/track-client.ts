interface ClientEventProps {
    url: string;
    title: string;
    appFunction: string;
    appComponent: string;
    details: object;
}

export async function trackClientEvent(props: ClientEventProps) {
    try {
        await fetch(props.url, {
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
