type LoadingProps = {
    message?: string;
};

const Loading = ({ message }: LoadingProps) => {

    return (
        <div className="w-100 h-100 text-center d-flex flex-column gap-2 align-items-center justify-content-center">
            <h3>{message || "Loading"}</h3>
            <span className="spinner-border" role="status" aria-hidden="true"></span>
        </div>
    );
};

export default Loading;
