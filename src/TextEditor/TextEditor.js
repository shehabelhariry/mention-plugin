import React, { useState, useRef, useEffect } from "react";
import SuggestionsPanel from "./SuggestionsPanel/SuggestionsPanel";

const TextEditor = ({
  name,
  triggerList,
  placeholder,
  style = {
    width: 400,
    border: " 1px solid #9f9f9f",
    fontSize: 14
  },
  highlightColor = "#eaeaea"
}) => {
  const editor = useRef(); // the text area editor
  const mirrorEditor = useRef(); // the mirror div containing all text up  to the selected trigger
  const fauxIndicator = useRef(); // the indicator in the mirror div

  //text area values and temp values
  const [textAreaValue, setTextAreaValue] = useState("");
  const [tempText, setTempText] = useState("");

  // panel state
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [postion, setPosition] = useState({ x: 0, y: 0 });

  // autoComplete
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [autoCompleteQuery, setAutoCompleteQuery] = useState("");
  const [isAutoCompleteMode, setIsAutoCompleteMode] = useState(false);

  useEffect(() => {
    if (autoCompleteQuery !== "" && activeTrigger) {
      triggerList
        .find(trigger => trigger.char === activeTrigger)
        .service(autoCompleteQuery)
        .then(items => {
          setSuggestions(items);
        });
    }
  }, [autoCompleteQuery, activeTrigger, triggerList]);

  useEffect(() => {
    setPosition({
      x: fauxIndicator.current.offsetLeft,
      y: fauxIndicator.current.offsetTop + style.fontSize
    });
  }, [tempText, style.fontSize]);

  const clearAndHideSuggestionsPanel = () => {
    setIsVisible(false);
    setSuggestions([]);
    setIsAutoCompleteMode(false);
    setAutoCompleteQuery("");
    setActiveTrigger(null);
  };

  const evaluateEditorHeight = () => {
    const field = editor.current;
    field.style.height = "inherit";
    var height = field.scrollHeight;
    field.style.height = height + "px";
  };

  const getAutoCompleteSearchQuery = () => {
    const lastTriggerIndex = tempText.lastIndexOf(activeTrigger);
    const isTriggerAtEnd =
      textAreaValue.slice(lastTriggerIndex).indexOf(" ") === -1;

    const nextSpaceIndex = isTriggerAtEnd
      ? textAreaValue.length - 1
      : textAreaValue.slice(lastTriggerIndex).indexOf(" ");

    return textAreaValue
      .substring(lastTriggerIndex - 1, nextSpaceIndex + lastTriggerIndex)
      .replace(activeTrigger, "")
      .trim();
  };

  const onKeyUp = e => {
    const currentCursorIndex = e.target.selectionEnd;
    const textUpToCursor = textAreaValue.slice(0, currentCursorIndex);

    if (isAutoCompleteMode && activeTrigger) {
      const query = getAutoCompleteSearchQuery(textAreaValue);
      setAutoCompleteQuery(query);
    }

    if (
      triggerList.map(trigger => trigger.char).includes(e.key) &&
      !isAutoCompleteMode
    ) {
      const { service, char } = triggerList.find(
        trigger => trigger.char === e.key
      );
      setActiveTrigger(char);
      setIsAutoCompleteMode(true);
      service().then(items => {
        setSuggestions(items);
      });
      setTempText(textUpToCursor);
      setIsVisible(true);
    } else {
      if (e.key === " " || e.key === "Backspace") {
        clearAndHideSuggestionsPanel();
      }
    }
  };

  const addSuggestionToTextArea = name => {
    const cursorPosition = tempText.length - 1;
    const textBeforetrigger = textAreaValue.substring(0, cursorPosition + 1);
    const textAfterAutoCompleteQuery = textAreaValue.substring(
      cursorPosition + autoCompleteQuery.length + 1
    );
    const editedTextArea = `${textBeforetrigger}${name}${textAfterAutoCompleteQuery}`;
    setTextAreaValue(editedTextArea);
    clearAndHideSuggestionsPanel();
    editor.current.focus();
  };

  const highlightTags = () => {
    let triggers = triggerList.map(item => item.char).join("");
    var regex = new RegExp(`([${triggers}][\\w_-]+)`, "g");

    console.log(regex);
    const matches = textAreaValue.match(regex);
    let ne = textAreaValue;
    if (matches) {
      matches.forEach(match => {
        ne = ne.replace(
          match,
          `<span style=" background-color: ${highlightColor} ">${match}</span>`
        );
      });
      return {
        __html: ne
      };
    }
  };

  const textEditorStyle = { ...style, lineHeight: 1.4 * style.fontSize + "px" };

  return (
    <div className="c-text-editor">
      <textarea
        name={name}
        className="c-text-editor__area"
        style={textEditorStyle}
        onChange={e => {
          setTextAreaValue(e.target.value);
          evaluateEditorHeight();
        }}
        value={textAreaValue}
        onKeyUp={onKeyUp}
        ref={editor}
        placeholder={placeholder}
      />
      <div
        className="c-text-editor__area__mirror highlight"
        style={textEditorStyle}
      >
        <pre dangerouslySetInnerHTML={highlightTags()} />
      </div>
      <div
        className="c-text-editor__area__mirror"
        ref={mirrorEditor}
        style={textEditorStyle}
      >
        <pre>
          {tempText}
          <span className="c-faux-indicator" ref={fauxIndicator} />
        </pre>
      </div>
      {isVisible && suggestions.length > 0 ? (
        <SuggestionsPanel
          suggestions={suggestions}
          position={postion}
          onSuggestionClicked={addSuggestionToTextArea}
        />
      ) : null}
    </div>
  );
};

export default TextEditor;
