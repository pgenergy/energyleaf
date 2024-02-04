import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@energyleaf/ui";
import {getAllUserData} from "@energyleaf/db/query";
import {TableBody, TableHeader} from "@energyleaf/ui";
import UserManagementTableRowHeader from "@/components/usermanagement/user-management-table-row-header";
import UserManagementTableRow from "@/components/usermanagement/user-management-table-row";

export default async function UserManagement() {
    const userData = await getAllUserData();

    const data = userData.map((entry) => ({
        id: entry.id,
        created: entry.created,
        email: entry.email,
        username: entry.username,
        password: entry.password,
        isAdmin: entry.isAdmin == 1,
        isActivated: false,
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Nutzerverwaltung</CardTitle>
                <CardDescription>Adminbereich</CardDescription>
            </CardHeader>
            <CardContent>
                <TableHeader>
                    <UserManagementTableRowHeader created="CREATED" email="EMAIL"
                                                  id="ID" isActivated="IS_ACTIVATED"
                                                  isAdmin="IS_ADMIN" password="PASSWORD"
                                                  username="USERNAME"/>
                </TableHeader>
                <TableBody>
                    {
                        userData.map((entry) => {
                            return (
                                <UserManagementTableRow created={entry.created} email={entry.email} id={entry.id}
                                                        isActivated={false} isAdmin={false}
                                                        password="*****" username={entry.username}/>
                            )
                        })
                    }
                </TableBody>
            </CardContent>
        </Card>
    );
}
