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
          suggestionValue: suggestion.name.first
        }))
      );
  };

  return (
    <div className="App">
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
        highlightColor="#eaeaea"
      />
    </div>
  );
}

export default App;
