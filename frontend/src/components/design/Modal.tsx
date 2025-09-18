import React from "react";
import ButtonField from "../fields/ButtonField";

type ModalProps = {
    title: string;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    children: React.ReactNode;
    onClose?: () => void;
    editMode?: boolean | undefined;
    setEditMode?: (editMode: boolean) => void;

    width?: number;
    maxHeight?: boolean;
};

const Modal = ({ title, showModal, setShowModal, children, onClose, width=9, editMode=undefined, setEditMode, maxHeight=false }: ModalProps) => {
    if (!showModal) return null;

    const handleClose = () => {
        setShowModal(false);
        if (onClose) onClose();
    }

    return (
        <div className="vw-100 vh-100 fixed-top d-flex flex-column justify-content-center align-items-center p-5" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className={`col-lg-${width} col-12 text-light p-4 rounded-4 bg-dark ${maxHeight ? "h-100" : "mh-100"}`}>
                <div className="d-flex flex-row justify-content-between align-items-center m-2">
                    <h3 className="d-flex flex-column align-content-between m-0">
                        {title}
                    </h3>
                    <div className="d-flex flex-row gap-2">
                        {setEditMode !== undefined && editMode !== undefined && (
                            <ButtonField 
                                onClick={() => setEditMode(!editMode)}
                                color="primary"
                                rounding="3"
                                outlineVariant={!editMode}
                                >
                                ✎
                            </ButtonField>
                        )}
                        <ButtonField
                            onClick={handleClose}
                            color="danger"
                            rounding="3"
                            outlineVariant>
                            ✖
                        </ButtonField>
                    </div>
                </div>
                <hr />
                <div className="d-flex flex-column gap-3 p-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
