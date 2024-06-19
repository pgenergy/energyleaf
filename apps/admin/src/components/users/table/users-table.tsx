import { usersTableColumns } from "@/components/users/table/users-table-columns";
import { getAllUsers } from "@/query/user";
import { Button, DataTable } from "@energyleaf/ui";
import UserCsvExportButton from "./user-csv-export-button";

export default async function UsersTable() {
    const users = await getAllUsers();
    const data = users.map((user) => {
        return {
            ...user,
            password: "",
        };
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <p className="font-medium">Nutzer exportieren</p>
                    <p className="text-muted-foreground text-sm">
                        Damit werden alle für das Experiment relevanten Nutzer als CSV exportiert.
                    </p>
                </div>
                <UserCsvExportButton />
            </div>
            <DataTable columns={usersTableColumns} data={data} />
        </div>
    );
}
