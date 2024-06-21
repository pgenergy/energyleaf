import { getActionSession } from "@/lib/auth/auth.action";
import { getAllExperimentUsers, log, logError, trackAction } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import * as csv from "csv/sync";
import { NextResponse } from "next/server";

export const GET = async () => {
    const { user, session } = await getActionSession();

    if (!session) {
        waitUntil(log("user/not-logged-in", "error", "csv-export-user", "api", {}));
        return NextResponse.json(
            {
                error: "Sie sind nicht angemeldet.",
                status: 401,
            },
            {
                status: 401,
            },
        );
    }

    const details = {
        userId: user.id,
    };

    try {
        const users = await getAllExperimentUsers();
        const parsedData = users.map((user) => {
            const parsedId = user.user.id.replace(/-_/g, "");
            const mail = user.user.email;
            const firstname = user.user.firstname.replace(/,/g, " ");
            const lastname = user.user.lastName.replace(/,/g, " ");

            return [firstname, lastname, mail, parsedId];
        });

        const csvData = csv.stringify([["Vorname", "Nachname", "Email", "ID"], ...parsedData]);
        waitUntil(trackAction("csv-export-user/success", "csv-export-user", "api", { details, session }));
        return new NextResponse(csvData, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=export_experiment_${new Date().getTime()}.csv`,
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (err) {
        waitUntil(logError("user/no-sensor-found", "csv-export-user", "api", { detailsObj: details }, err));
        return NextResponse.json(
            {
                error: "Ein Fehler ist aufgetreten.",
                status: 500,
            },
            {
                status: 500,
            },
        );
    }
};
