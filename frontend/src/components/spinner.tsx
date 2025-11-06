export default function Spinner({ size = 20, color = "border-accent" }: { size?: number, color?: string }) {
    return (
        <div
            className={`${color} border-t-transparent border-solid rounded-full animate-spin`}
            style={{ width: size, height: size, borderWidth: size / 15 }}
        ></div>
    );
}
