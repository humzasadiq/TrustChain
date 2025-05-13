function ToggleSwitch({ checked, onChange }) {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <span className="mr-2 text-sm text-muted-foreground">Connect</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
            checked ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </label>
    )
  }

  export default ToggleSwitch
  