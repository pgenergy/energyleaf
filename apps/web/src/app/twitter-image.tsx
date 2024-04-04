import { ImageResponse } from "next/og";

export const alt = "Energyleaf";
export const size = {
    width: 1200,
    height: 600,
};

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background:
                        "linear-gradient(90deg, rgba(67,152,105,1) 0%, rgba(49,124,74,1) 35%, rgba(31,85,56,1) 100%)",
                    color: "white",
                }}
            >
                <div
                    style={{
                        fontSize: "10rem",
                        fontWeight: "bold",
                    }}
                >
                    Energyleaf
                </div>
            </div>
        ),
        {
            ...size,
        },
    );
}
