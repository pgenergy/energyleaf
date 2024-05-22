import { getUserDataById } from "@/query/user";
import { userDataElectricityMeterTypeEnums } from "@energyleaf/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    userId: string;
}

export default async function UserOnboardingCard({ userId }: Props) {
    const data = await getUserDataById(userId);

    if (
        !data ||
        (data.wifiAtElectricityMeter === null &&
            data.powerAtElectricityMeter === null &&
            !data.electricityMeterImgUrl &&
            !data.electricityMeterType)
    ) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Onboarding Informationen</CardTitle>
                <CardDescription>Hier stehen einige Informationen über den Zähler der Person</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {data.electricityMeterType ? (
                    <div className="flex flex-row justify-between">
                        <p>Zählerart</p>
                        <p>{userDataElectricityMeterTypeEnums[data.electricityMeterType]}</p>
                    </div>
                ) : null}
                {data.electricityMeterImgUrl ? (
                    <div className="flex flex-row justify-between">
                        <p>Foto vom Zähler</p>
                        <a href={data.electricityMeterImgUrl} target="_blank" rel="noreferrer">
                            Anzeigen
                        </a>
                    </div>
                ) : null}
                {data.wifiAtElectricityMeter ? (
                    <div className="flex flex-row justify-between">
                        <p>Wifi vorhanden?</p>
                        <p>{data.wifiAtElectricityMeter ? "Ja" : "Nein"}</p>
                    </div>
                ) : null}
                {data.powerAtElectricityMeter ? (
                    <div className="flex flex-row justify-between">
                        <p>Strom vorhanden?</p>
                        <p>{data.wifiAtElectricityMeter ? "Ja" : "Nein"}</p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
