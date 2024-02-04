import UserManagementTableRow from "@/components/usermanagement/user-management-table-row";
import {TableHeader} from "@energyleaf/ui";

interface Props {
    userdata: { id: number, created: string, email: string, username: string, password: string, isAdmin: boolean, isActivated: boolean }[];
}

export default function UserManagementTableHeader({userdata}: Props) {
    return (
        <TableHeader>
            <UserManagementTableRow created="CREATED" email="EMAIL"
                                    id="ID" isActivated="IS_ACTIVATED"
                                    isAdmin="IS_ADMIN" password="PASSWORD"
                                    username="USERNAME"/>
        </TableHeader>
    );
}