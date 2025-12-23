type ModalProps = {
    show: boolean;
    setShow: (show: boolean) => void;

    title?: string;

    children: React.ReactNode;
    tabs?: React.ReactNode;

    onConfirm?: () => void;
    onCancel?: () => void;
};

const Modal = ({ show, setShow, title, children, onConfirm, onCancel, tabs }: ModalProps) => {
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        setShow(false);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        setShow(false);
    };


    return (
        <>
            <div className={`fixed inset-0 bg-background/50 flex justify-center items-center z-50 transition-opacity duration-200 ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className={`${tabs ? 'w-3/5' : 'w-1/2'} min-h-1/2 max-h-[75vh] bg-midground border-border border-2 text-text p-5 rounded-xl shadow-lg mx-auto flex flex-col`}>
                    {/* Top section */}
                    {title && (
                        <>
                            <h2 className="text-xl font-semibold text-center">{title}</h2>
                            <hr className="my-4 border-border" />
                        </>
                    )}

                    {/* Middle section */}
                    {tabs ? (
                        <div className="flex flex-row flex-grow min-h-0">
                            <div className="w-1/4 overflow-visible border-r-2 border-border pr-2">
                                {tabs}
                            </div>
                            <div className="w-3/4 overflow-y-auto no-scrollbar pl-2">
                                {children}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto no-scrollbar min-h-0">
                            {children}
                        </div>
                    )}




                    {/* Bottom section */}
                    <hr className="my-4 border-border" />
                    <div className="w-full flex justify-end gap-3">
                        {onCancel && (
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-full bg-transparent border-danger border-2 text-text hover:bg-danger transition-all duration-200"
                            >
                                Cancel
                            </button>
                        )}
                        {onConfirm && (
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 rounded-full bg-transparent border-accent border-2 text-text hover:bg-accent transition-all duration-200"
                            >
                                Confirm
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default Modal;