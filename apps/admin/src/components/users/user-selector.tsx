import { getAllUsersAction } from "@/actions/user";
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
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
    selectedUserName?: string | null;
    selectedUserId?: string | null;
    onUserSelected: (userId: string | null) => void;
}

export default function UserSelector({ selectedUserId, onUserSelected, selectedUserName }: Props) {
    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsersAction(),
    });
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        console.log(users);
    }, [users]);

    return (
        <Popover onOpenChange={setIsOpen} open={isOpen}>
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
                                users?.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        onSelect={() => {
                                            if (selectedUserId !== user.id) {
                                                onUserSelected(user.id);
                                            }
                                            setIsOpen(false);
                                        }}
                                        value={user.username}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedUserId === user.id ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                        {user.username}
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
