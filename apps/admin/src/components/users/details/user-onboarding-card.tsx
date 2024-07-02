import { getUserDataById } from "@/query/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import UserOnboardingForm from "./user-onboarding-form";

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
            !data.electricityMeterType &&
            !data.electricityMeterNumber)
    ) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Onboarding Informationen</CardTitle>
                <CardDescription>Hier stehen einige Informationen über den Zähler der Person</CardDescription>
            </CardHeader>
            <CardContent>
                <UserOnboardingForm
                    initialValues={{
                        meterNumber: data.electricityMeterNumber || "",
                        meterType: data.electricityMeterType || "digital",
                        hasWifi: data.wifiAtElectricityMeter || false,
                        hasPower: data.powerAtElectricityMeter || false,
                    }}
                    id={userId}
                    fileUrl={data.electricityMeterImgUrl || undefined}
                />
            </CardContent>
        </Card>
    );
}
