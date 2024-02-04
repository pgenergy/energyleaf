import {Suspense} from "react";

import {Skeleton} from "@energyleaf/ui";
import UserManagement from "@/components/usermanagement/user-management";


export default function UsermanagementPage() {
    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserManagement/>
            </Suspense>
        </div>
    );
}
