import { usersTableColumns } from "@/components/users/table/users-table-columns";

import { DataTable } from "@energyleaf/ui";
import {getAllUsers} from "@/query/user";

export default async function UsersTable() {
    const users = await getAllUsers();
    const data = users.map((user) => {
        return {
            id: user.id,
            username: user.username,
            mail: user.email,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
        };
    });

    return <DataTable columns={usersTableColumns} data={data} />;
}
