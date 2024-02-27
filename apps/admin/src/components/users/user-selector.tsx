import { useEffect, useMemo, useRef, useState, useTransition, type ChangeEvent } from "react";
import { getAllUsers } from "@/actions/user";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input,
    Spinner,
} from "@energyleaf/ui";

interface User {
    id: number;
    name: string;
}

interface Props {
    selectedUserName?: string | null;
    selectedUserId?: number | null;
    onUserSelected: (userId: number | null) => void;
}

export default function UserSelector({ selectedUserId, onUserSelected, selectedUserName }: Props) {
    const [isLoading, startLoadTransition] = useTransition();
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    function loadUsers(isOpened: boolean) {
        setIsOpen(isOpened);
        if (!isOpened) {
            setUsers([]);
            setSearch("");
            return;
        }

        startLoadTransition(async () => {
            const allUsers = (await getAllUsers()).map((user) => ({
                id: user.id,
                name: user.username,
            }));
            setUsers(allUsers);
        });
    }

    function onSearchTextChanged(event: ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    const filteredUsers = useMemo(
        () => users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase())),
        [users, search],
    );
    const slicedUsers = useMemo(() => {
        let filteredUsersCopy = [...filteredUsers];

        if (search === "" && selectedUserId !== undefined) {
            // selected user should be part of the list when no search is active
            filteredUsersCopy = filteredUsersCopy.filter((user) => user.id !== selectedUserId).slice(0, 4);
            const selectedUser = users.find((user) => user.id === selectedUserId);
            if (selectedUser) {
                filteredUsersCopy.push(selectedUser);
            }
        } else {
            filteredUsersCopy = filteredUsersCopy.slice(0, 5);
        }

        return filteredUsersCopy;
    }, [filteredUsers, selectedUserId, search, users]);

    return (
        <DropdownMenu onOpenChange={loadUsers}>
            <DropdownMenuTrigger>
                {selectedUserId && selectedUserName ? (
                    <a href={`/users/${selectedUserId}`}>{selectedUserName}</a>
                ) : (
                    <i>Nicht zugeordnet</i>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <Input
                        onChange={onSearchTextChanged}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                        }}
                        placeholder="Suchen"
                        ref={inputRef}
                    />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoading ? (
                    <DropdownMenuItem disabled>
                        <Spinner />
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuCheckboxItem
                            checked={selectedUserId === null}
                            onClick={(_) => {
                                onUserSelected(null);
                            }}
                        >
                            <i>Nicht zugeordnet</i>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />

                        {slicedUsers.map((user) => (
                            <DropdownMenuCheckboxItem
                                checked={user.id === selectedUserId}
                                key={user.id}
                                onClick={(_) => {
                                    onUserSelected(user.id);
                                }}
                            >
                                {user.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
