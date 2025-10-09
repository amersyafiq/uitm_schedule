export const style = {
    control: (base) => ({
        ...base,
        minHeight: "28px",
        height: "28px",
        fontSize: "0.875rem",
        borderColor: "#d1d5db",
        boxShadow: "none",
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 6px",
    }),
    input: (base) => ({
        ...base,
        fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
        ...base,
        fontSize: "0.875rem",
    }),
    singleValue: (base) => ({
        ...base,
        fontSize: "0.875rem",
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "2px",
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: "2px",
    }),
    menu: (base) => ({
        ...base,
        fontSize: "0.875rem",
    }),
    option: (base, state) => ({
        ...base,
        fontSize: "0.875rem",
        padding: "4px 8px",
        backgroundColor: state.isFocused ? "#e5e7eb" : "white", // gray-200 on hover
        color: "black",
    }),
}