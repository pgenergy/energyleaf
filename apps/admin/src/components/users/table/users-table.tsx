import { getAllUsers } from "@/actions/user";
import { usersTableColumns } from "@/components/users/table/users-table-columns";

import { DataTable } from "@energyleaf/ui";

export default async function UsersTable() {
    const users = await getAllUsers();
    const data = users.map((user) => {
        return {
            ...user,
            password: "",
        };
    });

    return <DataTable columns={usersTableColumns} data={data} />;
}
