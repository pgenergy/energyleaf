import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input, Spinner
} from "@energyleaf/ui";
import React, {useEffect, useMemo, useRef, useTransition} from "react";
import {getAllUsers} from "@/actions/user";

interface User {
    id: number;
    name: string;
}

interface Props {
    selectedUserName?: string | null;
    selectedUserId?: number | null;
    onUserSelected: (userId: number | null) => void;
}

export default function UserSelector({selectedUserId, onUserSelected, selectedUserName}: Props) {
    const [isLoading, startLoadTransition] = useTransition()
    const [users, setUsers] = React.useState<User[]>([])
    const [search, setSearch] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    function loadUsers(isOpened: boolean) {
        setIsOpen(isOpened)
        if (!isOpened) {
            setUsers([])
            setSearch("")
            return
        }

        startLoadTransition(async () => {
            const users = (await getAllUsers())
                .map((user) => ({
                    id: user.id,
                    name: user.username,
                }))
            setUsers(users)
        })
    }

    function onSearchTextChanged(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value)
    }

    function filterUser(user: User): boolean {
        return user.name.toLowerCase().includes(search.toLowerCase())
    }

    const filteredUsers = useMemo(() => users.filter(filterUser), [users, search])
    const slicedUsers = useMemo(() => {
        let slicedUsers = [...filteredUsers];

        if (search === "" && selectedUserId !== undefined) {
            slicedUsers = slicedUsers.filter(user => user.id !== selectedUserId).slice(0, 4);
            const selectedUser = users.find(user => user.id === selectedUserId)
            if (selectedUser) {
                slicedUsers.push(selectedUser);
            }
        } else {
            slicedUsers = slicedUsers.slice(0, 5);
        }

        return slicedUsers;
    }, [filteredUsers, selectedUserId])

    return (
        <DropdownMenu onOpenChange={loadUsers}>
            <DropdownMenuTrigger>
                {selectedUserId && selectedUserName
                    ? (<a href={`/users/${selectedUserId}`}>{selectedUserName}</a>)
                    : (<i>Nicht zugeordnet</i>)
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <Input ref={inputRef} placeholder="Suchen" onChange={onSearchTextChanged}
                           onKeyDown={(e) => e.stopPropagation()}/>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {
                    isLoading ?
                        <DropdownMenuItem disabled>
                            <Spinner/>
                        </DropdownMenuItem>
                        :
                        <>
                            <DropdownMenuCheckboxItem checked={selectedUserId === null}
                                                      onClick={_ => onUserSelected(null)}>
                                <i>Nicht zugeordnet</i>
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator/>


                            {slicedUsers.map((user) => (
                                <DropdownMenuCheckboxItem key={user.id} onClick={_ => onUserSelected(user.id)}
                                                          checked={user.id === selectedUserId}>
                                    {user.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </>
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );
}