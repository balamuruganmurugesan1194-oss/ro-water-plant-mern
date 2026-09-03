import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  error = false,
  renderOption,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSelect = (option) => {
    onChange(option.value);

    setOpen(false);
    setSearch("");
  };

  const clearSelection = (event) => {
    event.stopPropagation();

    onChange("");
    setSearch("");
  };

  return (
    <div
      ref={wrapperRef}
      className={`searchable-select ${error ? "has-error" : ""}`}
    >
      {/* Select Button */}

      <button
        type="button"
        className="searchable-select-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className={selectedOption ? "selected-value" : "placeholder-value"}
        >
          {selectedOption?.label || placeholder}
        </span>

        <span className="select-actions">
          {selectedOption && (
            <X size={15} className="clear-select" onClick={clearSelection} />
          )}

          <ChevronDown
            size={18}
            className={`select-arrow ${open ? "rotate" : ""}`}
          />
        </span>
      </button>

      {/* Dropdown */}

      {open && (
        <div className="searchable-dropdown">
          {/* Search */}

          <div className="dropdown-search">
            <Search size={16} />

            <input
              ref={searchRef}
              type="text"
              value={search}
              placeholder="Search category..."
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />

            {search && (
              <X
                size={15}
                className="search-clear"
                onClick={() => setSearch("")}
              />
            )}
          </div>

          {/* Options */}

          <div className="dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`dropdown-option ${
                    option.value === value ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <span>{option.label}</span>
                  )}

                  {option.value === value && <Check size={16} />}
                </button>
              ))
            ) : (
              <div className="no-options">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
