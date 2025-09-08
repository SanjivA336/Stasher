import { StorageType } from "@/apis/_schemas";

const ColorDecoder = (type: StorageType) => {
    if (type === StorageType.FREEZER) {
        return "secondary"
    }
    if (type === StorageType.FRIDGE) {
        return "info";
    }
    if (type === StorageType.PANTRY) {
        return "warning";
    }
    if (type === StorageType.GARDEN) {
        return "primary";
    }
    if (type === StorageType.OTHER) {
        return "light text-dark";
    }
};

export default ColorDecoder;
