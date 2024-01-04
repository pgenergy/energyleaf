import { Skeleton } from "@energyleaf/ui";

export default function ProfileLoading() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}
