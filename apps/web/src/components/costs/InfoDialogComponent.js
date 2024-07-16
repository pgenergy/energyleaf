import React from 'react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@energyleaf/ui/alert-dialog";
import { InfoIcon } from "lucide-react";

const AlertDialogComponent = ({ description }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button>
                    <InfoIcon className="h-4 w-4" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Information</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction asChild>
                        <button>OK</button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AlertDialogComponent;
