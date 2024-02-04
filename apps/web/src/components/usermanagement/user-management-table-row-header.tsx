
import { TableCell, TableRow} from "@energyleaf/ui";

interface Props {
    id: number;
    created: string;
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
    isActivated: boolean;
}

export default function UserManagementTableRowHeader({id, created, email, username, password, isAdmin, isActivated}: Props) {
    return (
        <TableRow>
            <TableCell>{id}</TableCell>
            <TableCell>{created}</TableCell>
            <TableCell>{email}</TableCell>
            <TableCell>{username}</TableCell>
            <TableCell>{password}</TableCell>
            <TableCell>{isAdmin}</TableCell>
            <TableCell >{isActivated}</TableCell>
        </TableRow>
    );
}
