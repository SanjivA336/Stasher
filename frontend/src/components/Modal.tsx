import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@apis/identityApi";
import { useState } from "react";
import { useStash } from "@/contexts/stash/StashContextValue";

import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";

type ModalProps = {
    show: boolean;
    setShow: (show: boolean) => void;

    title?: string;

    children: React.ReactNode;

    onConfirm?: () => void;
    onCancel?: () => void;
};

const Modal = ({ show, setShow, title, children, onConfirm, onCancel }: ModalProps) => {

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
            <div className={`w-full h-full bg-background/50 flex justify-between items-center fixed top-0 ${show ? 'block opacity-100' : 'hidden opacity-0'} transition-opacity duration-200`}>
                <div className="w-1/2 min-h-1/2 max-h-3/4 bg-midground border-border border-2 text-text p-5 rounded-xl shadow-lg mx-auto">
                    <div className="w-full">
                        {title && <h2 className="text-xl font-semibold text-center">{title}</h2>}
                        <hr className="my-4 border-border" />
                        {children}
                        <hr className="my-4 border-border" />
                        <div className="flex justify-end gap-3">

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
            </div>
        </>
    );
};

export default Modal;