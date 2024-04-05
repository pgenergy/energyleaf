import { useEffect, useRef, useState, useTransition } from "react";
import { getAllUsersAction } from "@/actions/user";
import { CheckIcon } from "lucide-react";

import { cn } from "@energyleaf/tailwindcss/utils";
import {
    Button,
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
} from "@energyleaf/ui";

interface User {
    id: string;
    name: string;
}

interface Props {
    selectedUserName?: string | null;
    selectedUserId?: string | null;
    onUserSelected: (userId: string | null) => void;
}

export default function UserSelector({ selectedUserId, onUserSelected, selectedUserName }: Props) {
    const [isLoading, startLoadTransition] = useTransition();
    const [users, setUsers] = useState<User[]>([]);
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
            return;
        }

        startLoadTransition(async () => {
            const allUsers = (await getAllUsersAction()).map((user) => ({
                id: user.id,
                name: user.username,
            }));

            setUsers(allUsers);
        });
    }

    return (
        <Popover onOpenChange={loadUsers} open={isOpen}>
            <PopoverTrigger asChild>
                <Button aria-expanded={isOpen} role="combobox" size="sm" variant="ghost">
                    {selectedUserName || "Nicht zugeordnet"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandInput placeholder="Nutzer Suchen" />
                    <CommandList>
                        <CommandGroup heading="Aktionen">
                            <CommandItem
                                onSelect={() => {
                                    onUserSelected(null);
                                    setIsOpen(false);
                                }}
                            >
                                <CheckIcon
                                    className={cn("mr-2 h-4 w-4", !selectedUserId ? "opacity-100" : "opacity-0")}
                                />
                                Nicht zugeordnet
                            </CommandItem>
                        </CommandGroup>
                        <CommandGroup heading="Nutzer">
                            {!isLoading ? (
                                users.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        onSelect={() => {
                                            onUserSelected(user.id);
                                            setIsOpen(false);
                                        }}
                                        value={user.name}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedUserId === user.id ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                        {user.name}
                                    </CommandItem>
                                ))
                            ) : (
                                <div className="flex justify-center">
                                    <Spinner />
                                </div>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
