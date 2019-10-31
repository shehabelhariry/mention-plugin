import React from "react";
import SuggestionsPanel from "./SuggestionsPanel/SuggestionsPanel";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textAreaValue: "",
      tempText: "",
      isVisible: false,
      suggestions: [],
      position: { x: 0, y: 0 },
      activeTrigger: null,
      autoCompleteQuery: "",
      isAutoCompleteMode: false
    };
    this.clearAndHideSuggestionsPanel = this.clearAndHideSuggestionsPanel.bind(
      this
    );
    this.onKeyUp = this.onKeyUp.bind(this);
    this.getAutoCompleteSearchQuery = this.getAutoCompleteSearchQuery.bind(
      this
    );
    this.addSuggestionToTextArea = this.addSuggestionToTextArea.bind(this);

    this.editor = React.createRef();
    this.mirrorEditor = React.createRef();
    this.fauxIndicator = React.createRef();
  }
  static defaultProps = {
    style: {
      width: 400,
      border: " 1px solid #9f9f9f",
      fontSize: 14,
      fontFamily: "sans-serif"
    },
    highlightColor: "#eaeaea"
  };

  clearAndHideSuggestionsPanel() {
    this.setState({
      isVisible: false,
      suggestions: [],
      isAutoCompleteMode: false,
      autoCompleteQuery: "",
      activeTrigger: null
    });
  }

  onKeyUp(e) {
    const { textAreaValue, isAutoCompleteMode, activeTrigger } = this.state;
    const { triggerList } = this.props;
    const currentCursorIndex = e.target.selectionEnd;
    const textUpToCursor = textAreaValue.slice(0, currentCursorIndex);

    if (isAutoCompleteMode && activeTrigger) {
      const query = this.getAutoCompleteSearchQuery(textAreaValue);
      this.setState({ autoCompleteQuery: query });
    }

    if (
      triggerList.map(trigger => trigger.char).includes(e.key) &&
      !isAutoCompleteMode
    ) {
      const { service, char } = triggerList.find(
        trigger => trigger.char === e.key
      );
      this.setState({ activeTrigger: char, isAutoCompleteMode: true });
      service().then(items => {
        this.setState({
          suggestions: items,
          tempText: textUpToCursor,
          isVisible: true
        });
      });
    } else {
      if (e.key === " " || e.key === "Backspace") {
        this.clearAndHideSuggestionsPanel();
      }
    }
  }

  getAutoCompleteSearchQuery() {
    const { textAreaValue, tempText, activeTrigger } = this.state;
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
  }

  addSuggestionToTextArea(name) {
    const { textAreaValue, tempText, autoCompleteQuery } = this.state;
    const cursorPosition = tempText.length - 1;
    const textBeforetrigger = textAreaValue.substring(0, cursorPosition + 1);
    const textAfterAutoCompleteQuery = textAreaValue.substring(
      cursorPosition + autoCompleteQuery.length + 1
    );
    const editedTextArea = `${textBeforetrigger}${name}${textAfterAutoCompleteQuery}`;
    this.setState({ textAreaValue: editedTextArea }, () => {
      this.clearAndHideSuggestionsPanel();
      this.editor.current.focus();
    });
  }

  evaluateEditorHeight() {
    const field = this.editor.current;
    field.style.height = "inherit";
    var height = field.scrollHeight;
    field.style.height = height + "px";
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.tempText !== this.state.tempText) {
      this.setState({
        position: {
          x: this.fauxIndicator.current.offsetLeft,
          y: this.fauxIndicator.current.offsetTop + 14
        }
      });
    }

    if (
      this.state.autoCompleteQuery !== "" &&
      this.state.activeTrigger &&
      prevState.autoCompleteQuery !== this.state.autoCompleteQuery
    ) {
      prevProps.triggerList
        .find(trigger => trigger.char === this.state.activeTrigger)
        .service(this.state.autoCompleteQuery)
        .then(items => {
          this.setState({ suggestions: items });
        });
    }
  }

  render() {
    const {
      textAreaValue,
      tempText,
      isVisible,
      suggestions,
      position
    } = this.state;
    const { name, style, placeholder } = this.props;
    const textEditorStyle = {
      ...style,
      lineHeight: 1.4 * style.fontSize + "px"
    };
    return (
      <div className="c-text-editor">
        <textarea
          name={name}
          className="c-text-editor__area"
          style={textEditorStyle}
          onChange={e => {
            this.setState({ textAreaValue: e.target.value });
            this.evaluateEditorHeight();
          }}
          value={textAreaValue}
          onKeyUp={this.onKeyUp}
          ref={this.editor}
          placeholder={placeholder}
        />
        <div
          className="c-text-editor__area__mirror"
          ref={this.mirrorEditor}
          style={textEditorStyle}
        >
          <pre>
            {tempText}
            <span className="c-faux-indicator" ref={this.fauxIndicator} />
          </pre>
        </div>
        {isVisible && suggestions.length > 0 ? (
          <SuggestionsPanel
            suggestions={suggestions}
            position={position}
            onSuggestionClicked={this.addSuggestionToTextArea}
          />
        ) : null}
      </div>
    );
  }
}

export default TextEditor;
