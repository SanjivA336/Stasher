import ErrorLayout from "@/layouts/ErrorLayout";

export default function PageNotFound() {

    return (
        <ErrorLayout>
            <div className="text-center">
                <h1 className="display-1">404</h1>
                <p className="lead">Page Not Found</p>
                <p className="text-muted">The page you are looking for does not exist.</p>
            </div>
        </ErrorLayout>
    );
}
