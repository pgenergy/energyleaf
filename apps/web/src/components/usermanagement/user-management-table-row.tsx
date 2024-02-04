"use client";

import {Dialog, DialogHeader, DialogTitle, DialogContent, TableCell, TableRow, Button} from "@energyleaf/ui";
import {useState} from "react";
import UserManagementEditForm from "@/components/usermanagement/user-management-edit-form";

interface Props {
    id: number;
    created: undefined;
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
    isActivated: boolean;
}

export default function UserManagementTableRow({id, created, email, username, password, isAdmin, isActivated}: Props) {
    const [open, setOpen] = useState(false);
    const [curId, setCurId] = useState<number>(0);

    const createdStr = created?.toString();

    function onClickRow(curId) {
        setCurId(curId);
        setOpen(true);
    }

    return (
        <TableRow key={id}>
            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User editieren{curId}</DialogTitle>
                        <UserManagementEditForm userId={curId} onInteract={() => {
                            setOpen(false)
                        }}/>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <TableCell key="id">{id}</TableCell>
            <TableCell key="createdStr">{createdStr}</TableCell>
            <TableCell key="email">{email}</TableCell>
            <TableCell key="username">{username}</TableCell>
            <TableCell key="password">{password}</TableCell>
            <TableCell key="isAdmin">{isAdmin == 1 ? ("Ja") : ("Nein")}</TableCell>
            <TableCell key="isActivated">{isActivated == 1 ? ("Ja") : ("Nein")}</TableCell>
            <TableCell key={"button" + id}><Button onClick={() => onClickRow(id)}>Edit</Button></TableCell>
        </TableRow>
    );
}
