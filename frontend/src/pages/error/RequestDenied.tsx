import ErrorLayout from "@/layouts/ErrorLayout";

export default function RequestDenied() {

    return (
        <ErrorLayout>
            <div className="text-center">
                <h1 className="display-1">403</h1>`
                <p className="lead">Access Denied</p>
                <p className="text-muted">You do not have permission to view this page.</p>
            </div>
        </ErrorLayout>
    );
}
