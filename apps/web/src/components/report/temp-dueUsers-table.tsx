
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@energyleaf/ui";
import {getUsersWitDueReport} from "@/query/user";

export default async function DueUsersTable() {

    const users = await getUsersWitDueReport();
    console.log(users);
    const data = users.map((u) => ({id: u.userId, username: u.userName, email: u.email, receiveMails: u.receiveMails}));

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeader>Username</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Receive Mails</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.receiveMails ? "Yes" : "No"}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
