import React from "react";

const SuggestionPanel = ({ position, suggestions, onSuggestionClicked }) => {
  return (
    <ul className="c-suggestions" style={{ top: position.y, left: position.x }}>
      {suggestions.map(suggestion => {
        const { suggestionValue, suggestionId, suggestionImg } = suggestion;
        return (
          <li key={suggestionId}>
            <a
              href={`#${suggestionId}`}
              onClick={e => {
                e.preventDefault();
                onSuggestionClicked(suggestionValue);
              }}
            >
              {suggestionImg ? (
                <div
                  className="c-suggestions__img"
                  style={{
                    backgroundImage: `url("${suggestionImg}")`
                  }}
                />
              ) : null}
              {suggestionValue}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SuggestionPanel;
