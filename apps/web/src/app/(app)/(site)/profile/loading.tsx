import { Skeleton } from "@energyleaf/ui";

export default function ProfileLoading() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="w-full h-96" />
            <Skeleton className="w-full h-96" />
            <Skeleton className="w-full h-96" />
        </div>
    );
}
