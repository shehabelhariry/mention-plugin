import React from "react";
import "./App.css";
import TextEditor from "./TextEditor/TextEditor";

function App() {
  const getSuggestions = (query = "") => {
    return fetch(`https://randomuser.me/api/?results=4&${query}`)
      .then(items => items.json())
      .then(items =>
        items.results.map(suggestion => ({
          ...suggestion,
          suggestionId: suggestion.cell,
          suggestionValue: suggestion.name.first,
          suggestionImg:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=80"
        }))
      );
  };

  return (
    <div className="App">
      <div>
        <TextEditor
          name="autocomplete"
          triggerList={[
            { char: "@", service: getSuggestions },
            {
              char: "#",
              service: getSuggestions
            }
          ]}
          placeholder="type @ and start typing to mention people"
        />
      </div>
    </div>
  );
}

export default App;
