import { usersTableColumns } from "@/components/users/table/users-table-columns";
import { getAllUsers } from "@/query/user";

import { DataTable } from "@energyleaf/ui";
import {getAllUsers} from "@/query/user";

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
