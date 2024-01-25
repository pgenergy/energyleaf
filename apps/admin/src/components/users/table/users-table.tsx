import type { UserTableType} from "@/components/users/table/users-table-columns";
import {usersTableColumns} from "@/components/users/table/users-table-columns";
import {DataTable} from "@energyleaf/ui/src/ui/data-table";

export default function UsersTable() {
    const dummyData: UserTableType[] = [
        {
            id: 1,
            username: "test",
            mail: "test@uni-oldenburg.de",
            active: true
        },
        {
            id: 2,
            username: "test2",
            mail: "test2@uni-oldenburg.de",
            active: false
        }
    ];
    return (
        <DataTable columns={usersTableColumns} data={dummyData}/>
    );
}